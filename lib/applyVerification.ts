import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { Prisma } from '@prisma/client';
import prisma from '@/prisma';
import { sendVerificationEmail, type VerificationMessage } from '@/lib/mail';
import {
  absoluteVerificationLink,
  decideVerification,
  type Account,
  type Command,
  type Decision,
  type Token,
  type World,
} from '@/lib/verificationMail';

export type VerificationView = {
  texts: string[];
  buttons: string[];
  success?: string;
  error?: string;
};

type StoredUser = {
  email: string;
  name: string;
  password: string | null;
  emailVerified: Date | null;
};

type StoredToken = {
  token: string;
  identifier: string;
  expires: Date;
};

type Write =
  | { kind: 'create-user'; user: Account }
  | { kind: 'verify'; email: string; emailVerified: number | null }
  | { kind: 'delete-user'; email: string }
  | { kind: 'replace-tokens'; email: string; tokens: Token[] };

type ReadyWrite =
  | { kind: 'create-user'; user: Account; passwordHash: string | null }
  | { kind: 'verify'; email: string; emailVerified: number | null }
  | { kind: 'delete-user'; email: string }
  | { kind: 'replace-tokens'; email: string; tokens: Token[] };

function accountFrom(user: StoredUser): Account {
  return {
    email: user.email,
    name: user.name,
    password: user.password,
    emailVerified: user.emailVerified ? user.emailVerified.getTime() : null,
  };
}

function tokenFrom(row: StoredToken): Token {
  return {
    token: row.token,
    email: row.identifier,
    expiresAt: row.expires.getTime(),
  };
}

export async function worldForEmail(email: string): Promise<World> {
  const [user, tokens] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.verificationRequest.findMany({ where: { identifier: email } }),
  ]);
  return {
    users: user ? [accountFrom(user)] : [],
    tokens: tokens.map(tokenFrom),
    messages: [],
  };
}

export async function worldForToken(token: string | null): Promise<World> {
  if (!token) {
    return { users: [], tokens: [], messages: [] };
  }
  const row = await prisma.verificationRequest.findUnique({ where: { token } });
  if (!row) {
    return { users: [], tokens: [], messages: [] };
  }
  return worldForEmail(row.identifier);
}

function sameTokens(left: Token[], right: Token[]) {
  const key = (token: Token) => `${token.token}\0${token.expiresAt}`;
  const leftKeys = left.map(key).sort();
  const rightKeys = right.map(key).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((value, index) => value === rightKeys[index])
  );
}

function planWrites(before: World, after: World): Write[] {
  const writes: Write[] = [];
  const beforeUsers = new Map(before.users.map((user) => [user.email, user]));
  const afterUsers = new Map(after.users.map((user) => [user.email, user]));

  for (const [email, user] of afterUsers) {
    const previous = beforeUsers.get(email);
    if (!previous) {
      writes.push({ kind: 'create-user', user });
      continue;
    }
    if (previous.emailVerified !== user.emailVerified) {
      writes.push({ kind: 'verify', email, emailVerified: user.emailVerified });
    }
  }

  for (const email of beforeUsers.keys()) {
    if (!afterUsers.has(email)) {
      writes.push({ kind: 'delete-user', email });
    }
  }

  const emails = new Set([
    ...before.tokens.map((token) => token.email),
    ...after.tokens.map((token) => token.email),
  ]);
  for (const email of emails) {
    const previous = before.tokens.filter((token) => token.email === email);
    const next = after.tokens.filter((token) => token.email === email);
    if (!sameTokens(previous, next)) {
      writes.push({ kind: 'replace-tokens', email, tokens: next });
    }
  }

  return writes;
}

export async function persistVerificationWorld(before: World, after: World) {
  const writes = planWrites(before, after);
  if (writes.length === 0) {
    return;
  }

  const ready: ReadyWrite[] = [];
  for (const write of writes) {
    if (write.kind === 'create-user') {
      ready.push({
        ...write,
        passwordHash: write.user.password ? await bcrypt.hash(write.user.password, 10) : null,
      });
    } else {
      ready.push(write);
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const write of ready) {
      if (write.kind === 'create-user') {
        await tx.user.create({
          data: {
            email: write.user.email,
            name: write.user.name,
            password: write.passwordHash,
            emailVerified:
              write.user.emailVerified === null ? null : new Date(write.user.emailVerified),
          },
        });
      } else if (write.kind === 'verify') {
        await tx.user.update({
          where: { email: write.email },
          data: {
            emailVerified: write.emailVerified === null ? null : new Date(write.emailVerified),
          },
        });
      } else if (write.kind === 'delete-user') {
        await tx.user.delete({ where: { email: write.email } });
      } else {
        await tx.verificationRequest.deleteMany({ where: { identifier: write.email } });
        for (const token of write.tokens) {
          await tx.verificationRequest.create({
            data: {
              identifier: token.email,
              token: token.token,
              expires: new Date(token.expiresAt),
            },
          });
        }
      }
    }
  });
}

function withSend(command: Command, send: 'accepted' | 'rejected'): Command {
  switch (command.kind) {
    case 'register':
    case 'sign-in':
    case 'resend-expired':
      return { ...command, send };
    default:
      return command;
  }
}

async function requestOrigin(): Promise<string | null> {
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  if (!host) {
    return null;
  }
  const forwarded = headerList.get('x-forwarded-proto');
  const proto =
    forwarded ?? (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function uniqueTarget(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return null;
  }
  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.map(String);
  }
  return typeof target === 'string' ? [target] : [];
}

async function deliver(messages: VerificationMessage[]): Promise<'accepted' | 'rejected'> {
  const origin = await requestOrigin();
  if (process.env.NODE_ENV === 'production' && !origin) {
    console.error('verification mail missing request origin');
    return 'rejected';
  }
  for (const message of messages) {
    const link = origin ? absoluteVerificationLink(message.link, origin) : message.link;
    const result = await sendVerificationEmail({ ...message, link });
    if (result === 'rejected') {
      return 'rejected';
    }
  }
  return 'accepted';
}

async function withNameTaken(command: Command): Promise<Command> {
  if (command.kind !== 'register') {
    return command;
  }
  const existing = await prisma.user.findUnique({ where: { name: command.name } });
  return existing ? { ...command, nameTaken: true } : command;
}

export async function applyVerification(
  before: World,
  command: Command,
  now: number,
): Promise<Decision> {
  const checked = await withNameTaken(command);
  let decision = decideVerification(before, withSend(checked, 'accepted'), now);
  try {
    await persistVerificationWorld(before, decision.world);
  } catch (error) {
    const target = uniqueTarget(error);
    if (checked.kind === 'register' && target?.some((field) => field.includes('name'))) {
      return decideVerification(before, { ...checked, nameTaken: true }, now);
    }
    if (checked.kind === 'register' && target?.some((field) => field.includes('email'))) {
      return decideVerification(
        {
          ...before,
          users: [
            ...before.users,
            {
              email: checked.email,
              name: checked.name,
              password: checked.password,
              emailVerified: null,
            },
          ],
        },
        withSend(checked, 'accepted'),
        now,
      );
    }
    throw error;
  }

  const newMessages = decision.world.messages.slice(before.messages.length);
  if (newMessages.length === 0) {
    return decision;
  }
  const result = await deliver(newMessages);
  if (result === 'accepted') {
    return decision;
  }
  const failed = decideVerification(before, withSend(checked, 'rejected'), now);
  await persistVerificationWorld(decision.world, failed.world);
  return failed;
}

export function verificationView(decision: Decision): VerificationView {
  const view: VerificationView = {
    texts: decision.texts,
    buttons: decision.buttons,
  };
  if (decision.success !== undefined) {
    view.success = decision.success;
  }
  if (decision.error !== undefined) {
    view.error = decision.error;
  }
  return view;
}
