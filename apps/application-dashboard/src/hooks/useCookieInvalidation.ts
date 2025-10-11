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

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
