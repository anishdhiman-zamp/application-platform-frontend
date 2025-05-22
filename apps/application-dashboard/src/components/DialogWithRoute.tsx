import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface DialogWithRouteProps {
  routes: string | string[];
  children: (props: { open: boolean; onOpenChange: (open: boolean) => void }) => React.ReactNode;
}

// Custom hook to handle route matching
const useRouteMatches = (routes: string[]) => {
  const pathname = usePathname();

  return React.useMemo(() => {
    return routes.some((route) => {
      const pattern = route.replace(/:[^/]+/g, '([^/]+)').replace(/\//g, '\\/');
      const regex = new RegExp(`^${pattern}$`);

      return regex.test(pathname);
    });
  }, [routes, pathname]);
};

export const DialogWithRoute: React.FC<DialogWithRouteProps> = ({ routes, children }) => {
  const router = useRouter();
  const routeArray = Array.isArray(routes) ? routes : [routes];
  const isOpen = useRouteMatches(routeArray);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return <>{children({ open: isOpen, onOpenChange: handleOpenChange })}</>;
};
