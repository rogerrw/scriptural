'use client';
import { useState, useTransition } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import {
  Calendar1Icon,
  ChevronDownIcon,
  ListIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';

import { logout } from '@/actions/auth';

import { Button } from '@/component-library/button';
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/component-library/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/component-library/dropdown-menu';
import { Separator } from '@/component-library/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/component-library/tooltip';

const menuLinkClass =
  'flex items-center gap-3 rounded-md px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';
const logoutLinkClass =
  'flex items-center gap-3 rounded-md px-3 py-3 text-sm text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800';

export function MobileHeaderMenu() {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="size-10 px-0 md:hidden" aria-label="Open menu">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[80vw] flex-col gap-1 border-r bg-background p-4 shadow-lg duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
          <div className="mb-2 flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">Menu</DialogTitle>
            <DialogPrimitive.Close
              className="rounded-sm p-2 opacity-70 hover:opacity-100"
              aria-label="Close menu"
            >
              <XIcon className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <Link href="/review" className={menuLinkClass} onClick={close}>
            <Calendar1Icon className="h-4 w-4" />
            Daily Review
          </Link>
          <Link href="/search" className={menuLinkClass} onClick={close}>
            <SearchIcon className="h-4 w-4" />
            Search for a verse
          </Link>
          <Link href="/verse_sets" className={menuLinkClass} onClick={close}>
            <ListIcon className="h-4 w-4" />
            Verse sets
          </Link>
          <Separator className="my-2 bg-gray-200 dark:bg-gray-800" />
          <Link href="/account" className={menuLinkClass} onClick={close}>
            <SettingsIcon className="h-4 w-4" />
            Account settings
          </Link>
          <Link
            href="/"
            className={logoutLinkClass}
            onClick={() => {
              close();
              startTransition(logout);
            }}
          >
            <LogOutIcon className="h-4 w-4" />
            Logout
          </Link>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

export function DesktopDailyReview() {
  return (
    <Button asChild className="z-10 hidden md:inline-flex">
      <Link href="/review" className="flex items-center gap-2">
        <Calendar1Icon className="h-4 w-4" />
        Daily Review
      </Link>
    </Button>
  );
}

export function DesktopHeaderActions() {
  const [, startTransition] = useTransition();

  return (
    <div className="z-10 ml-auto hidden items-center gap-2 md:flex">
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
            <Link href="/account" className="flex w-full cursor-pointer items-center gap-2">
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
    </div>
  );
}
