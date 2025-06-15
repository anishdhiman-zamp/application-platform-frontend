import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    const registerSW = async () => {
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported in this browser');

        return;
      }

      try {
        const { register } = await import('@/utils/serviceWorker');
        const registration = await register();

        console.log('Service worker registered:', registration?.scope);
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    registerSW();

    const onControllerChange = () => {
      console.log('Service worker controller changed');
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);
};
