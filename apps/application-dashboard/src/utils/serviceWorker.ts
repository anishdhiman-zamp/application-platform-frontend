import { captureException } from '@sentry/browser';

export const register = (): Promise<ServiceWorkerRegistration | undefined> => {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator)) {
      const error = new Error('Service workers are not supported in this browser');

      captureException(error);

      return reject(error);
    }

    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl, { scope: '/' })
      .then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;

          if (installingWorker) {
            installingWorker.onstatechange = () => {};
          }
        };

        resolve(registration);
      })
      .catch((error) => {
        captureException('Error during service worker registration:', error);
        reject(error);
      });
  });
};

export const unregister = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator)) {
      captureException('Service workers are not supported in this browser');

      return resolve(false);
    }

    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.unregister();
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        captureException('Error unregistering service worker:', error);
        reject(error);
      });
  });
};
