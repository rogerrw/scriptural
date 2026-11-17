import assert from 'node:assert/strict';
import test from 'node:test';
import { authRoutes, publicRoutes } from '../routes.ts';
import { absoluteVerificationLink } from './verificationMail.ts';

const NOW = 1_700_000_000_000;
const HOUR = 60 * 60 * 1000;
const FROM = 'Scriptural <noreply@scriptural.app>';
const SUBJECT = 'Confirm your email';

type Account = {
  email: string;
  name: string;
  password: string | null;
  emailVerified: number | null;
};

type Token = {
  token: string;
  email: string;
  expiresAt: number;
};

type RecordedMessage = {
  to: string;
  from: string;
  subject: string;
  link: string;
};

type World = {
  users: Account[];
  tokens: Token[];
  messages: RecordedMessage[];
};

type Command =
  | {
      kind: 'register';
      email: string;
      name: string;
      password: string;
      send: 'accepted' | 'rejected';
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

type Decision = {
  world: World;
  error?: string;
  success?: string;
  signedIn: boolean;
  texts: string[];
  buttons: string[];
};

function world(partial: Partial<World> = {}): World {
  return {
    users: partial.users ?? [],
    tokens: partial.tokens ?? [],
    messages: partial.messages ?? [],
  };
}

function ada(partial: Partial<Account> = {}): Account {
  return {
    email: 'ada@example.com',
    name: 'Ada',
    password: 'password1',
    emailVerified: null,
    ...partial,
  };
}

function tokenFor(email: string, expiresAt: number, token = 'live-token'): Token {
  return { token, email, expiresAt };
}

async function decide(current: World, command: Command): Promise<Decision> {
  const loaded = await import('./verificationMail.ts');
  const decideVerification = loaded.decideVerification as (
    current: World,
    command: Command,
    now: number,
  ) => Decision;
  return decideVerification(current, command, NOW);
}

function liveToken(decision: Decision, email: string): Token {
  const found = decision.world.tokens.find(
    (item) => item.email === email && item.expiresAt > NOW,
  );
  assert.ok(found, `expected an unexpired token for ${email}`);
  return found;
}

test('/auth/verify is public and a signed-in person is not redirected home', () => {
  assert.equal(publicRoutes.includes('/auth/verify'), true);
  assert.equal(authRoutes.includes('/auth/verify'), false);
});

test('a new account records a confirmation message and stays signed out', async () => {
  const decision = await decide(world(), {
    kind: 'register',
    email: 'ada@example.com',
    name: 'Ada',
    password: 'password1',
    send: 'accepted',
  });

  assert.equal(decision.success, 'Confirmation email sent!');
  assert.equal(decision.error, undefined);
  assert.equal(decision.signedIn, false);
  assert.equal(decision.world.users.length, 1);
  assert.equal(decision.world.users[0].email, 'ada@example.com');
  assert.equal(decision.world.users[0].name, 'Ada');
  assert.equal(decision.world.users[0].emailVerified, null);
  const token = liveToken(decision, 'ada@example.com');
  assert.equal(token.expiresAt, NOW + HOUR);
  assert.equal(decision.world.messages.length, 1);
  assert.deepEqual(decision.world.messages[0], {
    to: 'ada@example.com',
    from: FROM,
    subject: SUBJECT,
    link: `/auth/verify?token=${token.token}`,
  });
});

test('a rejected register send leaves no account and no token', async () => {
  const decision = await decide(world(), {
    kind: 'register',
    email: 'ada@example.com',
    name: 'Ada',
    password: 'password1',
    send: 'rejected',
  });

  assert.equal(decision.error, 'Could not send the confirmation email.');
  assert.equal(decision.success, undefined);
  assert.equal(decision.signedIn, false);
  assert.deepEqual(decision.world.users, []);
  assert.deepEqual(decision.world.tokens, []);
  assert.deepEqual(decision.world.messages, []);
});

test('register refuses an unverified email and leaves the live token', async () => {
  const current = world({
    users: [ada()],
    tokens: [tokenFor('ada@example.com', NOW + HOUR)],
  });
  const before = structuredClone(current);
  const decision = await decide(current, {
    kind: 'register',
    email: 'ada@example.com',
    name: 'Ada',
    password: 'password1',
    send: 'accepted',
  });

  assert.equal(decision.error, 'Email already in use');
  assert.equal(decision.success, undefined);
  assert.deepEqual(decision.world.tokens, before.tokens);
  assert.deepEqual(decision.world.messages, []);
});

test('register refuses a taken username and sends nothing', async () => {
  const decision = await decide(world(), {
    kind: 'register',
    email: 'ada@example.com',
    name: 'Ada',
    password: 'password1',
    send: 'accepted',
    nameTaken: true,
  });

  assert.equal(decision.error, 'Username already in use');
  assert.equal(decision.success, undefined);
  assert.deepEqual(decision.world.users, []);
  assert.deepEqual(decision.world.tokens, []);
  assert.deepEqual(decision.world.messages, []);
});

test('a verification link keeps its path and gains the request origin', () => {
  assert.equal(
    absoluteVerificationLink('/auth/verify?token=abc', 'https://scriptural.app'),
    'https://scriptural.app/auth/verify?token=abc',
  );
});

test('register refuses a verified email and writes no token', async () => {
  const decision = await decide(
    world({ users: [ada({ emailVerified: NOW - HOUR })] }),
    {
      kind: 'register',
      email: 'ada@example.com',
      name: 'Ada',
      password: 'password1',
      send: 'accepted',
    },
  );

  assert.equal(decision.error, 'Email already in use');
  assert.deepEqual(decision.world.tokens, []);
  assert.deepEqual(decision.world.messages, []);
});

test('a wrong password sends nothing and writes no token', async () => {
  const decision = await decide(world({ users: [ada()] }), {
    kind: 'sign-in',
    email: 'ada@example.com',
    passwordMatches: false,
    send: 'accepted',
  });

  assert.equal(decision.error, 'Invalid credentials');
  assert.equal(decision.success, undefined);
  assert.equal(decision.signedIn, false);
  assert.deepEqual(decision.world.tokens, []);
  assert.deepEqual(decision.world.messages, []);
});

test('a missing account signs in as invalid credentials', async () => {
  const decision = await decide(world(), {
    kind: 'sign-in',
    email: 'ada@example.com',
    passwordMatches: true,
    send: 'accepted',
  });

  assert.equal(decision.error, 'Invalid credentials');
  assert.equal(decision.signedIn, false);
  assert.deepEqual(decision.world.messages, []);
});

test('sign-in with no token sends a confirmation message and stays signed out', async () => {
  const decision = await decide(world({ users: [ada()] }), {
    kind: 'sign-in',
    email: 'ada@example.com',
    passwordMatches: true,
    send: 'accepted',
  });

  assert.equal(decision.success, 'Confirmation email sent!');
  assert.equal(decision.signedIn, false);
  assert.equal(decision.world.users[0].emailVerified, null);
  const token = liveToken(decision, 'ada@example.com');
  assert.equal(token.expiresAt, NOW + HOUR);
  assert.deepEqual(decision.world.messages[0], {
    to: 'ada@example.com',
    from: FROM,
    subject: SUBJECT,
    link: `/auth/verify?token=${token.token}`,
  });
});

test('an expired token is replaced when sign-in send is accepted', async () => {
  const decision = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW, 'expired-token')],
    }),
    {
      kind: 'sign-in',
      email: 'ada@example.com',
      passwordMatches: true,
      send: 'accepted',
    },
  );

  assert.equal(decision.success, 'Confirmation email sent!');
  assert.equal(decision.signedIn, false);
  assert.equal(
    decision.world.tokens.some((item) => item.token === 'expired-token'),
    false,
  );
  const token = liveToken(decision, 'ada@example.com');
  assert.equal(decision.world.messages[0].link, `/auth/verify?token=${token.token}`);
});

test('a token that expires at the current time is not live', async () => {
  const decision = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW, 'boundary-token')],
    }),
    {
      kind: 'sign-in',
      email: 'ada@example.com',
      passwordMatches: true,
      send: 'accepted',
    },
  );

  assert.equal(
    decision.world.tokens.some((item) => item.token === 'boundary-token'),
    false,
  );
  assert.equal(liveToken(decision, 'ada@example.com').expiresAt, NOW + HOUR);
});

test('a live token stays and sign-in records no new message', async () => {
  const current = world({
    users: [ada()],
    tokens: [tokenFor('ada@example.com', NOW + 1, 'still-live')],
  });
  const before = structuredClone(current);
  const decision = await decide(current, {
    kind: 'sign-in',
    email: 'ada@example.com',
    passwordMatches: true,
    send: 'accepted',
  });

  assert.equal(decision.success, 'Confirmation email sent!');
  assert.equal(decision.error, undefined);
  assert.equal(decision.signedIn, false);
  assert.deepEqual(decision.world.tokens, before.tokens);
  assert.deepEqual(decision.world.messages, []);
});

test('a rejected sign-in send leaves the account and no token', async () => {
  const decision = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW - 1, 'expired-token')],
    }),
    {
      kind: 'sign-in',
      email: 'ada@example.com',
      passwordMatches: true,
      send: 'rejected',
    },
  );

  assert.equal(decision.error, 'Could not send the confirmation email.');
  assert.equal(decision.success, undefined);
  assert.equal(decision.signedIn, false);
  assert.equal(decision.world.users.length, 1);
  assert.deepEqual(decision.world.tokens, []);
  assert.deepEqual(decision.world.messages, []);
});

test('a verified password signs in and records no message', async () => {
  const decision = await decide(world({ users: [ada({ emailVerified: NOW - HOUR })] }), {
    kind: 'sign-in',
    email: 'ada@example.com',
    passwordMatches: true,
    send: 'accepted',
  });

  assert.equal(decision.signedIn, true);
  assert.equal(decision.error, undefined);
  assert.deepEqual(decision.world.messages, []);
  assert.deepEqual(decision.world.tokens, []);
});

test('opening a valid link confirms and offers log in', async () => {
  const decision = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW + HOUR, 'confirm-token')],
    }),
    {
      kind: 'open-verify',
      token: 'confirm-token',
      alreadySignedIn: false,
    },
  );

  assert.equal(decision.texts.includes('Email confirmed! You may now log in'), true);
  assert.deepEqual(decision.buttons, ['Log in']);
  assert.equal(decision.signedIn, false);
  assert.equal(decision.world.users[0].emailVerified, NOW);
  assert.deepEqual(decision.world.tokens, []);
  assert.deepEqual(decision.world.messages, []);
});

test('a second confirm finds no token and leaves emailVerified set', async () => {
  const confirmed = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW + HOUR, 'confirm-token')],
    }),
    { kind: 'confirm', token: 'confirm-token', alreadySignedIn: false },
  );
  const decision = await decide(confirmed.world, {
    kind: 'confirm',
    token: 'confirm-token',
    alreadySignedIn: false,
  });

  assert.equal(decision.texts.includes('This link is not valid.'), true);
  assert.deepEqual(decision.buttons, []);
  assert.equal(decision.world.users[0].emailVerified, NOW);
});

test('a signed-in person can open the link and stay signed in', async () => {
  const decision = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW + HOUR, 'confirm-token')],
    }),
    { kind: 'open-verify', token: 'confirm-token', alreadySignedIn: true },
  );

  assert.equal(decision.texts.includes('Email confirmed! You may now log in'), true);
  assert.deepEqual(decision.buttons, ['Log in']);
  assert.equal(decision.signedIn, true);
  assert.equal(decision.world.users[0].emailVerified, NOW);
  assert.deepEqual(decision.world.tokens, []);
});

test('confirming while signed in leaves the session', async () => {
  const decision = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW + HOUR, 'confirm-token')],
    }),
    { kind: 'confirm', token: 'confirm-token', alreadySignedIn: true },
  );

  assert.equal(decision.texts.includes('Email confirmed! You may now log in'), true);
  assert.deepEqual(decision.buttons, ['Log in']);
  assert.equal(decision.signedIn, true);
  assert.equal(decision.world.users[0].emailVerified, NOW);
  assert.deepEqual(decision.world.tokens, []);
});

test('opening an expired link sends nothing', async () => {
  const current = world({
    users: [ada()],
    tokens: [tokenFor('ada@example.com', NOW - 1, 'expired-token')],
  });
  const before = structuredClone(current);
  const decision = await decide(current, {
    kind: 'open-verify',
    token: 'expired-token',
    alreadySignedIn: false,
  });

  assert.equal(decision.texts.includes('This link has expired.'), true);
  assert.deepEqual(decision.buttons, ['Send a new confirmation email']);
  assert.equal(decision.buttons.includes('Confirm email'), false);
  assert.deepEqual(decision.world.tokens, before.tokens);
  assert.deepEqual(decision.world.messages, []);
});

test('the expired button sends a new message', async () => {
  const decision = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW - 1, 'expired-token')],
    }),
    { kind: 'resend-expired', token: 'expired-token', send: 'accepted' },
  );

  assert.equal(decision.success, 'Confirmation email sent!');
  assert.equal(
    decision.world.tokens.some((item) => item.token === 'expired-token'),
    false,
  );
  const token = liveToken(decision, 'ada@example.com');
  assert.equal(token.expiresAt, NOW + HOUR);
  assert.deepEqual(decision.world.messages[0], {
    to: 'ada@example.com',
    from: FROM,
    subject: SUBJECT,
    link: `/auth/verify?token=${token.token}`,
  });
});

test('an expired token with no account does not send', async () => {
  const decision = await decide(
    world({ tokens: [tokenFor('ada@example.com', NOW - 1, 'expired-token')] }),
    { kind: 'resend-expired', token: 'expired-token', send: 'accepted' },
  );

  assert.equal(decision.texts.includes('This link is not valid.'), true);
  assert.deepEqual(decision.buttons, []);
  assert.deepEqual(decision.world.messages, []);
  assert.deepEqual(decision.world.tokens, [tokenFor('ada@example.com', NOW - 1, 'expired-token')]);
});

test('a rejected send from the expired page keeps the expired token', async () => {
  const decision = await decide(
    world({
      users: [ada()],
      tokens: [tokenFor('ada@example.com', NOW - 1, 'expired-token')],
    }),
    { kind: 'resend-expired', token: 'expired-token', send: 'rejected' },
  );

  assert.equal(decision.error, 'Could not send the confirmation email.');
  assert.equal(decision.success, undefined);
  assert.deepEqual(decision.world.tokens, [
    tokenFor('ada@example.com', NOW - 1, 'expired-token'),
  ]);
  assert.equal(decision.world.users.length, 1);
  assert.deepEqual(decision.world.messages, []);
});

test('an unknown token shows neither button', async () => {
  const current = world({ users: [ada()] });
  const before = structuredClone(current);
  const decision = await decide(current, {
    kind: 'open-verify',
    token: 'missing',
    alreadySignedIn: false,
  });

  assert.equal(decision.texts.includes('This link is not valid.'), true);
  assert.deepEqual(decision.buttons, []);
  assert.deepEqual(decision.world, before);
  assert.deepEqual(decision.world.messages, []);
});

test('a missing token shows neither button', async () => {
  const decision = await decide(world(), {
    kind: 'open-verify',
    token: null,
    alreadySignedIn: false,
  });

  assert.equal(decision.texts.includes('This link is not valid.'), true);
  assert.deepEqual(decision.buttons, []);
  assert.deepEqual(decision.world.messages, []);
});

test('Google sign-in records no confirmation message', async () => {
  const decision = await decide(world({ users: [ada({ password: null, emailVerified: NOW })] }), {
    kind: 'google-sign-in',
  });

  assert.equal(decision.signedIn, true);
  assert.equal(decision.error, undefined);
  assert.deepEqual(decision.world.messages, []);
  assert.deepEqual(decision.world.tokens, []);
});
