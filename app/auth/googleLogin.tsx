'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/component-library/button';

import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

const GoogleLogin = () => {
  return (
    <Button
      className="w-full"
      onClick={() =>
        signIn('google', {
          callbackUrl: DEFAULT_LOGIN_REDIRECT,
        })
      }
    >
      <FcGoogle />
      Log in with Google
    </Button>
  );
};

export default GoogleLogin;
