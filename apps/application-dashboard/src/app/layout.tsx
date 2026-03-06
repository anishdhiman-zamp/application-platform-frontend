// Import global styles
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@zamp-platform/ui';
import { FAVICON } from 'constants/icons';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import { ThemeProvider } from '@/app/_providers/theme-provider';
import NetworkStatus from '@/components/NetWorkStatus';
import { THEME_MODE } from '@/modules/general/constants/general.constants';
import { THEME_COOKIE } from '@/utils/cookie';
import { COLOR_SCHEME_HEADER, getThemeClasses, THEME_INIT_SCRIPT } from '@/utils/theme.utils';
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const themePreference = cookieStore.get(THEME_COOKIE)?.value || THEME_MODE.LIGHT;
  const osColorScheme = requestHeaders.get(COLOR_SCHEME_HEADER) ?? undefined;
  const theme = getThemeClasses(themePreference as THEME_MODE, osColorScheme);

  return (
    <html lang='en' className={`${inter.className} overscroll-none ${theme.html}`} suppressHydrationWarning>
      <body className={`${theme.body} bg-BACKGROUND_GRAY_1 h-screen antialiased`} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>
          <SpeedInsights />
          <NetworkStatus />
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
