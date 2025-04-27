'use client';
import { FileTextIcon, HandHeartIcon, InfoIcon, ShieldCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Footer = () => {
  const currentPath = usePathname();

  const renderFooterLink = (path: string, label: string, icon: React.ReactNode) => {
    const linkStyles = `
      hover:opacity-100 ${path === currentPath ? 'opacity-100' : 'opacity-50'} 
      transition-opacity
      text-sm
    `;
    return (
      <Link className={linkStyles} href={path}>
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
      </Link>
    );
  };

  return (
    <footer className="fadein mx-8 flex gap-8 px-8 py-2">
      {renderFooterLink('/about', 'About', <InfoIcon className="h-4 w-4" />)}
      {renderFooterLink('/support', 'Support', <HandHeartIcon className="h-4 w-4" />)}
      {renderFooterLink('/terms', 'Terms', <FileTextIcon className="h-4 w-4" />)}
      {renderFooterLink('/privacy', 'Privacy', <ShieldCheckIcon className="h-4 w-4" />)}
    </footer>
  );
};

export default Footer;
