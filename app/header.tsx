import { Button } from '@/component-library/button';
import { auth, signOut } from '@/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar1Icon, ListIcon, LogOutIcon, SearchIcon, UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/component-library/dropdown-menu';
import { DropdownMenuTrigger } from '@/component-library/dropdown-menu';

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <UserIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link href="/dashboard">Account</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <>
              <LogOutIcon />
              <Link href="/auth/logout">Logout</Link>
            </>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="fadein mx-8 flex items-center justify-between p-8">
      <Link href="/">
        <Image src="/sample_logo.png" width={240} height={40} alt="Picture of the author" />
      </Link>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/review" className="flex items-center gap-2">
            <Calendar1Icon className="h-4 w-4" />
            Daily Review
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/search" className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/verse_sets" className="flex items-center gap-2">
            <ListIcon className="h-4 w-4" />
          </Link>
        </Button>
        {!!session ? renderUserAccount() : renderLoginButton()}
      </div>
    </header>
  );
};

export default Header;
