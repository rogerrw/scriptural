import '@/app/ui/global.css';
import Header from './ui/components/header';
import Footer from './ui/components/footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-mode="dark" className={`antialiased`}>
        <div
          id="app-container"
          className="grid h-lvh min-h-full grid-rows-3 gap-8 bg-background py-8"
        >
          <Header />
          <div id="app-body-container" className="grid">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
