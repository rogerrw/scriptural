import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="flex gap-4">
      <Link href="/">About</Link>
      <Link href="/">Support</Link>
      <Link href="/">Terms</Link>
      <Link href="/">Privacy</Link>
    </footer>
  );
};

export default Footer;
