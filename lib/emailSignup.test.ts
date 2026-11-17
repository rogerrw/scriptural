import assert from 'node:assert/strict';
import test from 'node:test';

const UNAVAILABLE = 'Email signup is unavailable.';

type EmailSignupAttempt =
  | {
      kind: 'register';
      email: string;
      name: string;
      password: string;
    }
  | {
      kind: 'password-sign-in';
      email: string;
      emailVerified: null;
    }
  | {
      kind: 'google-sign-in';
    };

async function loadDecideEmailSignup(): Promise<
  (attempt: EmailSignupAttempt) => unknown
> {
  const loaded = await import('./emailSignup.ts');
  return loaded.decideEmailSignup;
}

function refusalError(decision: unknown) {
  if (decision !== null && typeof decision === 'object' && 'error' in decision) {
    return decision.error;
  }
  return undefined;
}

test('submitting registration returns Email signup is unavailable and describes no user or token', async () => {
  const decideEmailSignup = await loadDecideEmailSignup();
  const decision = decideEmailSignup({
    kind: 'register',
    email: 'new@example.com',
    name: 'Ada',
    password: 'password1',
  });
  assert.equal(decision instanceof Promise, false);
  assert.deepEqual(decision, { error: UNAVAILABLE });
});

test('unverified password sign-in returns Email signup is unavailable and describes no token', async () => {
  const decideEmailSignup = await loadDecideEmailSignup();
  const decision = decideEmailSignup({
    kind: 'password-sign-in',
    email: 'ada@example.com',
    emailVerified: null,
  });
  assert.equal(decision instanceof Promise, false);
  assert.deepEqual(decision, { error: UNAVAILABLE });
});

test('google sign-in is not rejected by the email signup rule', async () => {
  const decideEmailSignup = await loadDecideEmailSignup();
  const decision = decideEmailSignup({ kind: 'google-sign-in' });
  assert.equal(decision instanceof Promise, false);
  assert.notEqual(decision, UNAVAILABLE);
  assert.notEqual(refusalError(decision), UNAVAILABLE);
});
