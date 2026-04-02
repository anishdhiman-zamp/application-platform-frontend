// Import global styles
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { FAVICON } from 'constants/icons';
import type { Metadata, Viewport } from 'next';
import { Funnel_Display, Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import Script from 'next/script';
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
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-inter',
  display: 'swap',
});

const funnelDisplay = Funnel_Display({
  subsets: ['latin'],
  variable: '--font-funnel-display',
  display: 'swap',
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
    <html
      lang='en'
      className={cn(inter.className, 'overscroll-none', funnelDisplay.variable, theme.html)}
      suppressHydrationWarning
    >
      <head>
        <Script id='theme-init' strategy='beforeInteractive' dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={cn(theme.body, 'bg-BG_GRAY_1 h-screen antialiased')} suppressHydrationWarning>
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
