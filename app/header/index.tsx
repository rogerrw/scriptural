import { auth } from '@/auth';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/component-library/button';
import PrivateHeaderActions from './PrivateHeaderActions';
const Header = async () => {
  const session = await auth();

  const renderPublicHeaderActions = () => (
    <Button asChild className="bg-white text-black">
      <Link href="/auth/signin">Login / Sign Up</Link>
    </Button>
  );

  return (
    <header className="fadein mx-8 flex items-center justify-between p-8">
      <Link href="/">
        <Image
          src="/logo.svg"
          width={276}
          height={60}
          alt="Picture of the author"
          className="max-h-12"
        />
      </Link>
      <div className="flex items-center gap-2">
        {!!session ? <PrivateHeaderActions /> : renderPublicHeaderActions()}
      </div>
    </header>
  );
};

export default Header;
