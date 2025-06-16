import { captureException } from '@sentry/browser';

export const register = (): Promise<ServiceWorkerRegistration | undefined> => {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator)) {
      const error = new Error('Service workers are not supported in this browser');

      captureException(error);

      return reject(error);
    }

    console.log('Attempting to register service worker...');
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl, { scope: '/' })
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope:', registration.scope);

        if (registration.waiting) {
          console.log('Service worker waiting, skip waiting...');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;

          if (installingWorker) {
            installingWorker.onstatechange = () => {
              console.log('Service worker state changed:', installingWorker.state);

              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('New content is available and will be used when all tabs are closed');
                } else {
                  console.log('Content is cached for offline use.');
                }
              }
            };
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
        console.log('Service worker unregistered:', result);
        resolve(result);
      })
      .catch((error) => {
        captureException('Error unregistering service worker:', error);
        reject(error);
      });
  });
};
