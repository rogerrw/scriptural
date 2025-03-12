import { Button } from '@/component-library/button';
import { auth } from '@/auth';
import Link from 'next/link';
import Image from 'next/image';

const Header = async () => {
  const session = await auth();
  const renderLoginButton = () => {
    return (
      <Button asChild className="bg-white text-black">
        <Link href="/auth/signin">Login / Sign Up</Link>
      </Button>
    );
  };

  const renderUserAccount = () => {
    return (
      <Button variant="ghost" asChild>
        <Link href="/dashboard" className="flex items-center gap-2">
          {session?.user?.name}
        </Link>
      </Button>
    );
  };

  return (
    <header className="fadein flex items-center justify-between p-8">
      <Link href="/">
        <Image src="/sample_logo.png" width={240} height={40} alt="Picture of the author" />
      </Link>
      <div>{!!session ? renderUserAccount() : renderLoginButton()}</div>
    </header>
  );
};

export default Header;
