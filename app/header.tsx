import { Button } from '@/component-library/button';
import { auth } from '@/auth';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar1Icon,
  ChevronDownIcon,
  ListIcon,
  LogOutIcon,
  SearchIcon,
  UserIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/component-library/dropdown-menu';
import { DropdownMenuTrigger } from '@/component-library/dropdown-menu';

const Header = async () => {
  const session = await auth();

  const renderPrivateHeaderActions = () => (
    <>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="link">
            <UserIcon className="h-4 w-4" />
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link href="/dashboard">Account</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <div className="flex items-center gap-2">
              <LogOutIcon className="h-4 w-4 text-red-500" />
              <Link className="text-red-500" href="/auth/logout">
                Logout
              </Link>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const renderPublicHeaderActions = () => (
    <Button asChild className="bg-white text-black">
      <Link href="/auth/signin">Login / Sign Up</Link>
    </Button>
  );

  return (
    <header className="fadein mx-8 flex items-center justify-between p-8">
      <Link href="/">
        <Image src="/sample_logo.png" width={240} height={40} alt="Picture of the author" />
      </Link>
      <div className="flex items-center gap-2">
        {!!session ? renderPrivateHeaderActions() : renderPublicHeaderActions()}
      </div>
    </header>
  );
};

export default Header;
