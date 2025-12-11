import { ROUTES_PATH } from '@/constants/routeConfig';

export const shouldShowTopbar = (pathname: string | null): boolean => {
  if (!pathname) return true;

  // Routes where topbar should be hidden
  const routesWithoutTopbar = [
    ROUTES_PATH.SETTINGS,
    '/processes/builder',
    // Add more routes as needed
  ];

  return !routesWithoutTopbar.some((route) => pathname.startsWith(route));
};

export const isSettingsPage = (pathname: string | null): boolean => {
  if (!pathname) return false;

  return pathname.startsWith(ROUTES_PATH.SETTINGS);
};
