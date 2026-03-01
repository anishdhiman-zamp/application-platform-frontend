// Import global styles
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@zamp-platform/ui';
import { FAVICON } from 'constants/icons';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import NetworkStatus from '@/components/NetWorkStatus';
import '@zamp-platform/ui/globals.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'styles/ag-styles.css';
import 'styles/common.css';
import 'styles/kb-styles.css';
import 'styles/react-datepicker.css';
import 'styles/react-dates.css';
import 'styles/tanstack-styles.css';

const inter = Inter({
  subsets: ['latin'], // Specify subsets you need (e.g., 'latin', 'latin-ext').
  variable: '--font-inter', // Define a CSS variable to use in your styles.
  display: 'swap', // Controls font-display behavior.
});

export const metadata: Metadata = {
  title: 'Zamp',
  description: 'Zamp AI',
  icons: {
    icon: FAVICON,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${inter.className} overscroll-none`}>
      <body className='light-mode bg-BACKGROUND_GRAY_1 h-screen antialiased'>
        <SpeedInsights />
        <NetworkStatus />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
