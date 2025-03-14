import '@/app/ui/global.css';
import { SessionProvider } from 'next-auth/react';
import Header from './header';
import Footer from './footer';
import { auth } from '@/auth';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className="dark">
      <body data-mode="dark" className={`dark font-mono antialiased`}>
        <SessionProvider session={session}>
          <div
            id="app-container"
            className="flex max-h-full min-h-full flex-col gap-8 bg-background"
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
