import { auth } from '@/auth';
import Link from 'next/link';
import Image from 'next/image';

import { DesktopDailyReview, DesktopHeaderActions, MobileHeaderMenu } from './PrivateHeaderActions';
const Header = async () => {
  const session = await auth();

  return (
    <header className="fadein relative mx-4 flex min-h-20 items-center p-4 md:mx-8 md:p-8">
      {session ? <MobileHeaderMenu /> : <div className="size-10 md:hidden" />}
      {session ? <DesktopDailyReview /> : null}
      <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/logo.svg"
          width={276}
          height={60}
          alt="Scriptural Logo"
          className="h-8 w-auto md:h-12"
        />
      </Link>
      {session ? <DesktopHeaderActions /> : null}
    </header>
  );
};

export default Header;
