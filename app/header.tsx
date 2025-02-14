import { auth } from '@/auth';

import { Button } from '@/component-library/button';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = async () => {
  const session = await auth();
  console.log(JSON.stringify(session));

  const renderLoginButton = () => {
    return <Link href="/auth/signin">Login / Sign Up</Link>;
  };

  const renderUserAccount = () => {
    return <Link href="/dashboard">{session?.user?.name}</Link>;
  };

  return (
    <header className="fadein flex justify-between p-8">
      <Link href="/">
        <Image src="/sample_logo.png" width={240} height={40} alt="Picture of the author" />
      </Link>
      <div>{!!session ? renderUserAccount() : renderLoginButton()}</div>
    </header>
  );
};

export default Header;
