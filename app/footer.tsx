'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Footer = () => {
  const currentPath = usePathname();

  const renderFooterLink = (path: string, label: string) => {
    const linkStyles = `hover:opacity-100 ${path === currentPath ? 'opacity-100' : 'opacity-50'}`;
    return (
      <Link className={linkStyles} href={path}>
        {label}
      </Link>
    );
  };

  return (
    <footer className="fadein mx-8 flex gap-8 px-8 py-2">
      {renderFooterLink('/about', 'About')}
      {renderFooterLink('/support', 'Support')}
      {renderFooterLink('/terms', 'Terms')}
      {renderFooterLink('/privacy', 'Privacy')}
    </footer>
  );
};

export default Footer;
