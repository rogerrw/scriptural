import '@/app/ui/global.css';
import Header from './ui/components/header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-mode="dark" className={`antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
