const HOUR = 60 * 60 * 1000;
const FROM = 'Scriptural <noreply@scriptural.app>';
const SUBJECT = 'Confirm your email';
const SENT = 'Confirmation email sent!';
const SEND_FAILED = 'Could not send the confirmation email.';
const EMAIL_IN_USE = 'Email already in use';
const USERNAME_IN_USE = 'Username already in use';
const INVALID_CREDENTIALS = 'Invalid credentials';
const CONFIRMED = 'Email confirmed! You may now log in';
const INVALID_LINK = 'This link is not valid.';
const EXPIRED_LINK = 'This link has expired.';
const LOGIN_BUTTON = 'Log in';
const RESEND_BUTTON = 'Send a new confirmation email';

export type Account = {
  email: string;
  name: string;
  password: string | null;
  emailVerified: number | null;
};

export type Token = {
  token: string;
  email: string;
  expiresAt: number;
};

export type RecordedMessage = {
  to: string;
  from: string;
  subject: string;
  link: string;
};

export type World = {
  users: Account[];
  tokens: Token[];
  messages: RecordedMessage[];
};

export type Command =
  | {
      kind: 'register';
      email: string;
      name: string;
      password: string;
      send: 'accepted' | 'rejected';
      nameTaken?: boolean;
    }
  | {
      kind: 'sign-in';
      email: string;
      passwordMatches: boolean;
      send: 'accepted' | 'rejected';
    }
  | { kind: 'open-verify'; token: string | null; alreadySignedIn: boolean }
  | { kind: 'confirm'; token: string; alreadySignedIn: boolean }
  | { kind: 'resend-expired'; token: string; send: 'accepted' | 'rejected' }
  | { kind: 'google-sign-in' };

export type Decision = {
  world: World;
  error?: string;
  success?: string;
  signedIn: boolean;
  texts: string[];
  buttons: string[];
};

type Outcome = {
  error?: string;
  success?: string;
  signedIn?: boolean;
  texts?: string[];
  buttons?: string[];
};

function copyWorld(world: World): World {
  return {
    users: world.users.map((user) => ({ ...user })),
    tokens: world.tokens.map((token) => ({ ...token })),
    messages: world.messages.map((message) => ({ ...message })),
  };
}

function decide(world: World, outcome: Outcome = {}): Decision {
  const decision: Decision = {
    world,
    signedIn: outcome.signedIn ?? false,
    texts: outcome.texts ?? [],
    buttons: outcome.buttons ?? [],
  };
  if (outcome.error !== undefined) {
    decision.error = outcome.error;
  }
  if (outcome.success !== undefined) {
    decision.success = outcome.success;
  }
  return decision;
}

export function absoluteVerificationLink(link: string, origin: string) {
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return link;
  }
  return `${origin}${link}`;
}

function confirmation(email: string, now: number): { token: Token; message: RecordedMessage } {
  const token = {
    token: crypto.randomUUID(),
    email,
    expiresAt: now + HOUR,
  };
  return {
    token,
    message: {
      to: email,
      from: FROM,
      subject: SUBJECT,
      link: `/auth/verify?token=${token.token}`,
    },
  };
}

function liveToken(world: World, email: string, now: number) {
  return world.tokens.find((token) => token.email === email && token.expiresAt > now);
}

function register(world: World, command: Extract<Command, { kind: 'register' }>, now: number) {
  if (world.users.some((user) => user.email === command.email)) {
    return decide(copyWorld(world), { error: EMAIL_IN_USE });
  }
  if (command.nameTaken) {
    return decide(copyWorld(world), { error: USERNAME_IN_USE });
  }
  if (command.send === 'rejected') {
    return decide(copyWorld(world), { error: SEND_FAILED });
  }

  const issued = confirmation(command.email, now);
  const next = copyWorld(world);
  next.users.push({
    email: command.email,
    name: command.name,
    password: command.password,
    emailVerified: null,
  });
  next.tokens.push(issued.token);
  next.messages.push(issued.message);
  return decide(next, { success: SENT });
}

function signIn(world: World, command: Extract<Command, { kind: 'sign-in' }>, now: number) {
  const user = world.users.find((item) => item.email === command.email);
  if (!user || !command.passwordMatches) {
    return decide(copyWorld(world), { error: INVALID_CREDENTIALS });
  }
  if (user.emailVerified !== null) {
    return decide(copyWorld(world), { signedIn: true });
  }
  if (liveToken(world, command.email, now)) {
    return decide(copyWorld(world), { success: SENT });
  }

  const next = copyWorld(world);
  next.tokens = next.tokens.filter((token) => token.email !== command.email);
  if (command.send === 'rejected') {
    // A failed sign-in send drops the expired token. The user row still holds the email.
    return decide(next, { error: SEND_FAILED });
  }

  const issued = confirmation(command.email, now);
  next.tokens.push(issued.token);
  next.messages.push(issued.message);
  return decide(next, { success: SENT });
}

function openVerify(world: World, command: Extract<Command, { kind: 'open-verify' }>, now: number) {
  const next = copyWorld(world);
  const token = command.token
    ? next.tokens.find((item) => item.token === command.token)
    : undefined;
  if (!token) {
    return decide(next, {
      texts: [INVALID_LINK],
      buttons: [],
      signedIn: command.alreadySignedIn,
    });
  }
  if (token.expiresAt <= now) {
    return decide(next, {
      texts: [EXPIRED_LINK],
      buttons: [RESEND_BUTTON],
      signedIn: command.alreadySignedIn,
    });
  }
  return confirm(
    world,
    { kind: 'confirm', token: token.token, alreadySignedIn: command.alreadySignedIn },
    now,
  );
}

function confirm(world: World, command: Extract<Command, { kind: 'confirm' }>, now: number) {
  const next = copyWorld(world);
  const token = next.tokens.find((item) => item.token === command.token);
  if (!token) {
    return decide(next, {
      texts: [INVALID_LINK],
      buttons: [],
      signedIn: command.alreadySignedIn,
    });
  }
  if (token.expiresAt <= now) {
    return decide(next, {
      texts: [EXPIRED_LINK],
      buttons: [RESEND_BUTTON],
      signedIn: command.alreadySignedIn,
    });
  }

  const user = next.users.find((item) => item.email === token.email);
  if (!user) {
    return decide(next, {
      texts: [INVALID_LINK],
      buttons: [],
      signedIn: command.alreadySignedIn,
    });
  }

  user.emailVerified = now;
  next.tokens = next.tokens.filter((item) => item.token !== command.token);
  return decide(next, {
    texts: [CONFIRMED],
    buttons: [LOGIN_BUTTON],
    signedIn: command.alreadySignedIn,
  });
}

function resend(world: World, command: Extract<Command, { kind: 'resend-expired' }>, now: number) {
  const token = world.tokens.find((item) => item.token === command.token);
  if (!token || !world.users.some((user) => user.email === token.email)) {
    return decide(copyWorld(world), { texts: [INVALID_LINK], buttons: [] });
  }
  if (token.expiresAt > now) {
    return decide(copyWorld(world), { success: SENT });
  }
  if (command.send === 'rejected') {
    // A failed resend keeps the expired token. That row is the only copy of the email.
    return decide(copyWorld(world), { error: SEND_FAILED, buttons: [RESEND_BUTTON] });
  }

  const next = copyWorld(world);
  next.tokens = next.tokens.filter((item) => item.email !== token.email);
  const issued = confirmation(token.email, now);
  next.tokens.push(issued.token);
  next.messages.push(issued.message);
  return decide(next, { success: SENT });
}

export function decideVerification(world: World, command: Command, now: number): Decision {
  switch (command.kind) {
    case 'register':
      return register(world, command, now);
    case 'sign-in':
      return signIn(world, command, now);
    case 'open-verify':
      return openVerify(world, command, now);
    case 'confirm':
      return confirm(world, command, now);
    case 'resend-expired':
      return resend(world, command, now);
    case 'google-sign-in':
      return decide(copyWorld(world), { signedIn: true });
  }
}
