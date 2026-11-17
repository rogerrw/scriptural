'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/component-library/button';
import { FormError, FormSuccess } from '@/app/ui/formMessage';
import { verifyIntent, type VerificationView } from '@/actions/auth/verify';

const VerifyForm = ({ token, initial }: { token: string | null; initial: VerificationView }) => {
  const [view, formAction, pending] = useActionState(verifyIntent, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token ?? ''} />
      {view.texts.map((text) =>
        text === 'Email confirmed! You may now log in' ? (
          <FormSuccess key={text} message={text} />
        ) : (
          <FormError key={text} message={text} />
        ),
      )}
      <FormError message={view.error} />
      <FormSuccess message={view.success} />
      {view.buttons.map((label) =>
        label === 'Log in' ? (
          <Button key={label} className="w-full" asChild>
            <Link href="/auth/signin">Log in</Link>
          </Button>
        ) : (
          <Button
            key={label}
            className="w-full"
            type="submit"
            name="intent"
            value={label}
            disabled={pending}
          >
            {label}
          </Button>
        ),
      )}
    </form>
  );
};

export default VerifyForm;
