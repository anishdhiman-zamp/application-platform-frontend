import { captureException } from '@sentry/browser';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const IDB_NAME = 'zamp-sw-store';
const IDB_STORE = 'config';
const ORG_ID_KEY = 'X-Zamp-Organization-Id';

/**
 * Opens the IndexedDB database used by the service worker.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
  });
}

/**
 * Stores the organization ID in IndexedDB for the service worker to access.
 */
async function setOrganizationIdInIDB(orgId: string): Promise<void> {
  let db: IDBDatabase | undefined;

  try {
    db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction(IDB_STORE, 'readwrite');
      const store = transaction.objectStore(IDB_STORE);
      const request = store.put(orgId, ORG_ID_KEY);

      request.onsuccess = () => {
        db!.close();
        resolve();
      };
      request.onerror = () => {
        db!.close();
        reject(request.error);
      };
    });
  } catch {
    db?.close();
  }
}

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

        // Sync organization ID to IndexedDB for service worker access
        syncOrganizationIdToSW();

        resolve(registration);
      })
      .catch((error) => {
        captureException('Error during service worker registration:', error);
        reject(error);
      });
  });
};

/**
 * Syncs the current organization ID to IndexedDB and notifies the service worker.
 * Call this whenever the organization ID changes (e.g., on org switch).
 */
export const syncOrganizationIdToSW = (): void => {
  const organizationId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) || '';

  // Store in IndexedDB for direct service worker access
  setOrganizationIdInIDB(organizationId).catch(() => {});

  // Also send via postMessage for immediate update if SW is already active
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SET_ORGANIZATION_ID',
      organizationId,
    });
  }
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
