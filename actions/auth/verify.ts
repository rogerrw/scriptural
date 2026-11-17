'use server';

import { auth } from '@/auth';
import {
  applyVerification,
  verificationView,
  worldForToken,
  type VerificationView,
} from '@/lib/applyVerification';
import { decideVerification } from '@/lib/verificationMail';

export type { VerificationView };

async function signedInNow() {
  const session = await auth();
  return !!session?.user;
}

export async function resendExpiredEmail(token: string): Promise<VerificationView> {
  const before = await worldForToken(token);
  const decision = await applyVerification(
    before,
    { kind: 'resend-expired', token, send: 'accepted' },
    Date.now(),
  );
  return verificationView(decision);
}

export async function verifyIntent(
  _previous: VerificationView,
  formData: FormData,
): Promise<VerificationView> {
  const tokenValue = formData.get('token');
  const intent = formData.get('intent');
  const token = typeof tokenValue === 'string' && tokenValue.length > 0 ? tokenValue : null;
  if (token === null || intent !== 'Send a new confirmation email') {
    const decision = decideVerification(
      { users: [], tokens: [], messages: [] },
      { kind: 'open-verify', token: null, alreadySignedIn: await signedInNow() },
      Date.now(),
    );
    return verificationView(decision);
  }
  return resendExpiredEmail(token);
}
