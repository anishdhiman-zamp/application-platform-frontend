import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@zamp-platform/ui/globals.css';

const inter = Inter({
  subsets: ['latin'], // Specify subsets you need (e.g., 'latin', 'latin-ext').
  variable: '--font-inter', // Define a CSS variable to use in your styles.
  display: 'swap', // Controls font-display behavior.
});

export const metadata: Metadata = {
  title: 'Zamp',
  description: 'Zamp AI',
  icons: {
    icon: '/icons/pace.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={inter.className}>
      <body className='light-mode h-screen bg-white antialiased'>
        <div className='flex h-full flex-col'>
          <main className='flex-1'>{children}</main>
        </div>
      </body>
    </html>
  );
}
