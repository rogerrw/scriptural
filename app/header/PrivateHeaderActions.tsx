'use client';

import {
  Calendar1Icon,
  ChevronDownIcon,
  ListIcon,
  LogOutIcon,
  SearchIcon,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';

import { logout } from '@/actions/auth';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/component-library/dropdown-menu';
import { Button } from '@/component-library/button';
import { DropdownMenuTrigger } from '@/component-library/dropdown-menu';
import { useTransition } from 'react';

const PrivateHeaderActions = () => {
  'use client';
  const [isPending, startTransition] = useTransition();

  return (
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
              <Link className="text-red-500" href="/" onClick={() => startTransition(logout)}>
                Logout
              </Link>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default PrivateHeaderActions;
