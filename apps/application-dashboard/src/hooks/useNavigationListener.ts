'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NAVIGATION_EVENT, NavigationEventDetail } from '@/utils/events';

/**
 * Hook that listens for navigation events and performs soft navigation.
 * Should be used once in a top-level provider component.
 */
export const useNavigationListener = () => {
  const router = useRouter();

  useEffect(() => {
    const handleNavigation = (event: CustomEvent<NavigationEventDetail>) => {
      const { path, replace } = event.detail;

      if (replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    };

    window.addEventListener(NAVIGATION_EVENT, handleNavigation as EventListener);

    return () => {
      window.removeEventListener(NAVIGATION_EVENT, handleNavigation as EventListener);
    };
  }, [router]);
};
