import '@/app/ui/global.css';
import { SessionProvider } from 'next-auth/react';
import Header from '@/app/header';
import Footer from './footer';
import { auth } from '@/auth';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className="dark">
      <body data-mode="dark" className="dark font-mono antialiased">
        <SessionProvider session={session}>
          <div
            id="app-container"
            className="mx-auto flex max-h-full min-h-full max-w-screen-xl flex-col gap-8 bg-background text-gray-700 dark:text-gray-300"
          >
            <Header />
            <div id="app-body-container" className="mx-8 flex-grow">
              {children}
            </div>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
