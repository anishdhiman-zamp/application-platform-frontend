import { useEffect } from 'react';
import { setCookie } from '@/utils/cookie';

export const useCookieInvalidation = (cookieId: string) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const clearSessionCookie = () => {
      setCookie(cookieId, '', -1);
    };

    const handleBeforeUnload = () => {
      clearSessionCookie();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearSessionCookie();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
