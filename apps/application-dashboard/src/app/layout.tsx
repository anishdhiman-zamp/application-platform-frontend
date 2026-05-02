// Import global styles
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { FAVICON } from 'constants/icons';
import { DialRoot } from 'dialkit';
import type { Metadata, Viewport } from 'next';
import { Funnel_Display, Geist, Geist_Mono, Inter } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import Script from 'next/script';
import { FontPresetProvider } from '@/app/_providers/font-preset-provider';
import { ThemeProvider } from '@/app/_providers/theme-provider';
import Agentation from '@/components/Agentation';
import NetworkStatus from '@/components/NetWorkStatus';
import TypographySwitcher from '@/components/TypographySwitcher';
import { FONT_PRESET, FONT_PRESET_CLASS, THEME_MODE } from '@/modules/general/constants/general.constants';
import { FONT_PRESET_COOKIE, THEME_COOKIE } from '@/utils/cookie';
import { COLOR_SCHEME_HEADER, getThemeClasses, THEME_INIT_SCRIPT } from '@/utils/theme.utils';
import '@zamp-platform/ui/globals.css';
import 'dialkit/styles.css';
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

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const funnelDisplay = Funnel_Display({
  subsets: ['latin'],
  variable: '--font-funnel-display',
  display: 'swap',
});

const VALID_FONT_PRESETS = new Set<string>([FONT_PRESET.GEIST, FONT_PRESET.INTER, FONT_PRESET.MONO]);

const resolveFontPreset = (raw: string | undefined): FONT_PRESET => {
  if (raw && VALID_FONT_PRESETS.has(raw)) return raw as FONT_PRESET;

  return FONT_PRESET.GEIST;
};

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

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const themePreference = cookieStore.get(THEME_COOKIE)?.value || THEME_MODE.LIGHT;
  const osColorScheme = requestHeaders.get(COLOR_SCHEME_HEADER) ?? undefined;
  const theme = getThemeClasses(themePreference as THEME_MODE, osColorScheme);
  const fontPreset = resolveFontPreset(cookieStore.get(FONT_PRESET_COOKIE)?.value);

  return (
    <html
      lang='en'
      className={cn(
        'overscroll-none',
        inter.variable,
        geist.variable,
        geistMono.variable,
        funnelDisplay.variable,
        FONT_PRESET_CLASS[fontPreset],
        theme.html,
      )}
      suppressHydrationWarning
    >
      <body className={cn(theme.body, 'bg-BG_GRAY_1 h-screen antialiased')} suppressHydrationWarning>
        <Script id='theme-init' strategy='beforeInteractive' dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>
          <FontPresetProvider initialPreset={fontPreset}>
            <SpeedInsights />
            <NetworkStatus />
            <Toaster />
            <Agentation />
            {process.env.NODE_ENV !== 'production' && (
              <>
                <TypographySwitcher />
                <DialRoot position='bottom-right' />
              </>
            )}
            {children}
          </FontPresetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
