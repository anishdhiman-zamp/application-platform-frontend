import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    const registerSW = async () => {
      if (!('serviceWorker' in navigator)) {
        return;
      }

      try {
        const { register } = await import('@/utils/serviceWorker');

        await register();
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    registerSW();

    const onControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);
};
