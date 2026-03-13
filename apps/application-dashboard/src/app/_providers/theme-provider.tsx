'use client';

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { THEME_MODE } from '@/modules/general/constants/general.constants';
import { getCookie, setCookie, THEME_COOKIE, THEME_COOKIE_MAX_AGE } from '@/utils/cookie';
import { LOCAL_STORAGE_KEYS } from '@/utils/localstorage';
import { THEME_CSS_CLASSES } from '@/utils/theme.utils';

const DARK_MODE_ROUTES = [ROUTES_PATH.CHAT];

type ResolvedTheme = THEME_MODE.LIGHT | THEME_MODE.DARK;

interface ThemeContextValue {
  theme: THEME_MODE;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: THEME_MODE) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return THEME_MODE.LIGHT;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_MODE.DARK : THEME_MODE.LIGHT;
}

function resolveTheme(theme: THEME_MODE): ResolvedTheme {
  return theme === THEME_MODE.SYSTEM ? getSystemTheme() : theme;
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  const body = document.body;

  root.classList.toggle(THEME_CSS_CLASSES.HTML_DARK, resolved === THEME_MODE.DARK);
  body.classList.toggle(THEME_CSS_CLASSES.BODY_DARK, resolved === THEME_MODE.DARK);
  body.classList.toggle(THEME_CSS_CLASSES.BODY_LIGHT, resolved === THEME_MODE.LIGHT);
}

function getStoredTheme(): THEME_MODE {
  if (typeof window === 'undefined') return THEME_MODE.LIGHT;

  return (
    (getCookie(THEME_COOKIE) as THEME_MODE) ||
    (localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) as THEME_MODE) ||
    THEME_MODE.LIGHT
  );
}

function persistTheme(theme: THEME_MODE) {
  localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  setCookie(THEME_COOKIE, theme, THEME_COOKIE_MAX_AGE);
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDarkModeAllowed = DARK_MODE_ROUTES.some((route) => pathname?.startsWith(route));
  const [theme, setThemeState] = useState<THEME_MODE>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(getStoredTheme()));

  const setTheme = useCallback((next: THEME_MODE) => {
    persistTheme(next);
    const resolved = resolveTheme(next);

    applyTheme(resolved);
    setThemeState(next);
    setResolvedTheme(resolved);
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  function syncFromStorage(
    setThemeState: (theme: THEME_MODE) => void,
    setResolvedTheme: (resolved: ResolvedTheme) => void,
  ) {
    const next = getStoredTheme();
    const resolved = resolveTheme(next);

    applyTheme(resolved);
    setThemeState(next);
    setResolvedTheme(resolved);
  }

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== THEME_MODE.SYSTEM) return;

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = () => {
      const next = getSystemTheme();

      applyTheme(next);
      setResolvedTheme(next);
    };

    colorSchemeQuery.addEventListener('change', handleColorSchemeChange);

    return () => colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
  }, [theme]);

  // Sync theme changes across browser tabs.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEYS.THEME) syncFromStorage(setThemeState, setResolvedTheme);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncFromStorage(setThemeState, setResolvedTheme);
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Enforce light mode on routes outside the Pace layout.
  useLayoutEffect(() => {
    if (!isDarkModeAllowed) {
      persistTheme(THEME_MODE.LIGHT);
      setTheme(THEME_MODE.LIGHT);
    }
  }, [isDarkModeAllowed, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
