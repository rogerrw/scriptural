import { Button } from '@/components/ui/button';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
const Header = () => {
  return (
    <header className="flex justify-between">
      <Link href="/">
        <Image src="/sample_logo.png" width={240} height={40} alt="Picture of the author" />
      </Link>
      <div>
        <Button>
          <Link href="/signin">Login / Sign Up</Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;