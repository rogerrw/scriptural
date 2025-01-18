import '@/app/ui/global.css';
import Header from './header';
import Footer from './footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body data-mode="dark" className={`dark antialiased`}>
        <div id="app-container" className="flex min-h-full flex-col gap-8 bg-background">
          <Header />
          <div id="app-body-container" className="h-full flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
