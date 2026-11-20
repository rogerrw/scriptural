'use server';

import { z } from 'zod';
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

const TokenSchema = z.string().uuid();

export async function resendExpiredEmail(token: string): Promise<VerificationView> {
  const parsed = TokenSchema.safeParse(token);
  if (!parsed.success) {
    const decision = decideVerification(
      { users: [], tokens: [], messages: [] },
      { kind: 'open-verify', token: null, alreadySignedIn: await signedInNow() },
      Date.now(),
    );
    return verificationView(decision);
  }

  const before = await worldForToken(parsed.data);
  const decision = await applyVerification(
    before,
    { kind: 'resend-expired', token: parsed.data, send: 'accepted' },
    Date.now(),
  );
  return verificationView(decision);
}

export async function verifyIntent(
  _previous: VerificationView,
  formData: FormData,
): Promise<VerificationView> {
  const parsed = z
    .object({
      token: TokenSchema,
      intent: z.literal('Send a new confirmation email'),
    })
    .safeParse({
      token: formData.get('token'),
      intent: formData.get('intent'),
    });
  if (!parsed.success) {
    const decision = decideVerification(
      { users: [], tokens: [], messages: [] },
      { kind: 'open-verify', token: null, alreadySignedIn: await signedInNow() },
      Date.now(),
    );
    return verificationView(decision);
  }
  return resendExpiredEmail(parsed.data.token);
}
