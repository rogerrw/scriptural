'use client';
import { useTransition } from 'react';

import {
  Calendar1Icon,
  ChevronDownIcon,
  ListIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';

import { logout } from '@/actions/auth';

import { Button } from '@/component-library/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/component-library/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/component-library/tooltip';

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/search"
              className="rounded-full p-4 opacity-50 transition-opacity hover:opacity-100"
            >
              <SearchIcon className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent className="border-none dark:bg-gray-800 dark:text-gray-100">
            <p>Search for a verse</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/verse_sets"
              className="rounded-full p-4 opacity-50 transition-opacity hover:opacity-100"
            >
              <ListIcon className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent className="border-none dark:bg-gray-800 dark:text-gray-100">
            <p>Verse sets</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="link" className="opacity-50 transition-opacity hover:opacity-100">
            <UserIcon className="h-4 w-4" />
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link href="/dashboard" className="flex w-full cursor-pointer items-center gap-2">
              <SettingsIcon />
              Account settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              className="flex w-full cursor-pointer items-center gap-2 text-red-400"
              href="/"
              onClick={() => startTransition(logout)}
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default PrivateHeaderActions;
