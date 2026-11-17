import { auth } from '@/auth';
import Link from 'next/link';
import Image from 'next/image';

import PrivateHeaderActions from './PrivateHeaderActions';
const Header = async () => {
  const session = await auth();

  return (
    <header className="fadein mx-8 flex items-center justify-between p-8">
      <Link href="/">
        <Image
          src="/logo.svg"
          width={276}
          height={60}
          alt="Scriptural Logo"
          className="h-12 w-auto"
        />
      </Link>
      {session ? (
        <div className="flex items-center gap-2">
          <PrivateHeaderActions />
        </div>
      ) : null}
    </header>
  );
};

export default Header;
