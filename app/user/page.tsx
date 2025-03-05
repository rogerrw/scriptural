import { auth } from '@/auth';
import { Button } from '@/component-library/button';
import Link from 'next/link';
import React from 'react';

const UserPage = async () => {
  const session = await auth();
  return (
    <div className="flex flex-col gap-10">
      <h1>Hello {session?.user?.name}!</h1>
      <div>
        <Button>
          <Link href="/user/collections">Collections</Link>
        </Button>
      </div>
      <div>
        <Button>
          <Link href="/auth/signin">Settings</Link>
        </Button>
      </div>
    </div>
  );
};

export default UserPage;
