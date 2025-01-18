import '@/app/ui/global.css';
import Header from './header';
import Footer from './footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body data-mode="dark" className={`dark font-mono antialiased`}>
        <div id="app-container" className="flex max-h-full min-h-full flex-col gap-8 bg-background">
          <Header />
          <div id="app-body-container" className="mx-8 flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
