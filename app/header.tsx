import { Button } from '@/component-library/button';
import { auth } from '@/auth';
import Link from 'next/link';
import Image from 'next/image';

const Header = async () => {
  const session = await auth();
  return (
    <header className="flex justify-between p-8">
      <Link href="/">
        <Image src="/sample_logo.png" width={240} height={40} alt="Picture of the author" />
      </Link>
      <div>
        <Button>
          <Link href={session ? '/user' : '/auth/signin'}>
            {session ? 'Profile' : 'Login / Sign Up'}
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;
