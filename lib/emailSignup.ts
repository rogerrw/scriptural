const EMAIL_SIGNUP_UNAVAILABLE = 'Email signup is unavailable.';

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

type EmailSignupDecision = { error: typeof EMAIL_SIGNUP_UNAVAILABLE } | { ok: true };

export function decideEmailSignup(attempt: EmailSignupAttempt): EmailSignupDecision {
  switch (attempt.kind) {
    case 'register':
    case 'password-sign-in':
      return { error: EMAIL_SIGNUP_UNAVAILABLE };
    case 'google-sign-in':
      return { ok: true };
  }
}
