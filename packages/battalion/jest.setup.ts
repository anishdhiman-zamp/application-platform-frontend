// Mock TextDecoder for blob utilities - must run before any modules are loaded
// This file runs in setupFiles, so Jest globals are not available yet
if (!global.TextDecoder) {
  global.TextDecoder = class TextDecoder {
    encoding = 'utf-8';
    fatal = false;
    ignoreBOM = false;

    constructor() {}

    decode(input?: BufferSource): string {
      if (!input) return '';
      return Buffer.from(input as ArrayBuffer).toString('utf-8');
    }
  } as typeof global.TextDecoder;
}

if (!global.TextEncoder) {
  global.TextEncoder = class TextEncoder {
    encoding = 'utf-8';

    constructor() {}

    encode(input: string = ''): Uint8Array {
      return new Uint8Array(Buffer.from(input, 'utf-8'));
    }

    encodeInto() {
      return { read: 0, written: 0 };
    }
  } as unknown as typeof global.TextEncoder;
}

// Mock IndexedDB for idb-keyval - must run before any modules are loaded
// This is a minimal mock that provides the basic structure needed
if (!global.indexedDB) {
  // In-memory storage for the mock: Map<dbName, Map<storeName, Map<key, value>>>
  const dbStorage: Map<string, Map<string, Map<string, unknown>>> = new Map();

  const createMockRequest = (result: unknown) => {
    const request = {
      result,
      error: null,
      onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
      onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
      onupgradeneeded: null as ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown) | null,
      readyState: 'done' as IDBRequestReadyState,
    };

    // Auto-resolve the request
    setTimeout(() => {
      if (request.onsuccess) {
        request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
      }
    }, 0);

    return request;
  };

  const createMockObjectStore = (dbName: string, storeName: string) => {
    if (!dbStorage.has(dbName)) {
      dbStorage.set(dbName, new Map());
    }
    const db = dbStorage.get(dbName)!;
    if (!db.has(storeName)) {
      db.set(storeName, new Map());
    }
    const store = db.get(storeName)!;

    return {
      put: (value: unknown, key?: string) => {
        const request = createMockRequest(key);
        setTimeout(() => {
          if (key) {
            store.set(key, value);
          }
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);
        return request;
      },
      get: (key: string) => {
        const request = createMockRequest(store.get(key));
        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);
        return request;
      },
      delete: (key: string) => {
        const request = createMockRequest(undefined);
        setTimeout(() => {
          store.delete(key);
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);
        return request;
      },
      clear: () => {
        const request = createMockRequest(undefined);
        setTimeout(() => {
          store.clear();
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);
        return request;
      },
      getAllKeys: () => {
        const request = createMockRequest(Array.from(store.keys()));
        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);
        return request;
      },
      openKeyCursor: () => {
        const keys = Array.from(store.keys());
        let index = 0;
        const request = createMockRequest(
          index < keys.length
            ? {
                key: keys[index++],
                continue: () => {
                  if (index < keys.length) {
                    (request.result as { key: string; continue: () => void }).key = keys[index++];
                    if (request.onsuccess) {
                      request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
                    }
                  } else {
                    request.result = null;
                    if (request.onsuccess) {
                      request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
                    }
                  }
                },
              }
            : null,
        );
        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);
        return request;
      },
      openCursor: () => {
        const entries = Array.from(store.entries());
        let index = 0;
        const request = createMockRequest(
          index < entries.length
            ? {
                key: entries[index][0],
                value: entries[index][1],
                continue: () => {
                  index++;
                  if (index < entries.length) {
                    const result = request.result as { key: string; value: unknown; continue: () => void };
                    result.key = entries[index][0];
                    result.value = entries[index][1];
                    if (request.onsuccess) {
                      request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
                    }
                  } else {
                    request.result = null;
                    if (request.onsuccess) {
                      request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
                    }
                  }
                },
              }
            : null,
        );
        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);
        return request;
      },
    };
  };

  const dbVersions: Map<string, number> = new Map();
  const dbStores: Map<string, Set<string>> = new Map();

  const mockIndexedDB = {
    open: (dbName: string, version?: number) => {
      const currentVersion = dbVersions.get(dbName) || 1;
      const requestedVersion = version || currentVersion;
      const needsUpgrade = requestedVersion > currentVersion || !dbStores.has(dbName);

      if (needsUpgrade) {
        dbVersions.set(dbName, requestedVersion);
        if (!dbStores.has(dbName)) {
          dbStores.set(dbName, new Set());
        }
      }

      const storeNames = Array.from(dbStores.get(dbName) || []);
      createMockObjectStore(dbName, 'keyval');

      const mockDB = {
        name: dbName,
        version: requestedVersion,
        objectStoreNames: {
          contains: (name: string) => storeNames.includes(name),
        },
        transaction: (storeNames: string | string[], mode?: IDBTransactionMode) => {
          const names = Array.isArray(storeNames) ? storeNames : [storeNames];
          // Use the first store name for the transaction
          const primaryStoreName = names[0] || 'keyval';
          console.log('primaryStoreName', primaryStoreName);
          return {
            objectStore: (name: string) => {
              if (!dbStores.get(dbName)?.has(name)) {
                dbStores.get(dbName)?.add(name);
              }
              return createMockObjectStore(dbName, name);
            },
            oncomplete: null,
            onerror: null,
            error: null,
            mode: mode || 'readonly',
            abort: () => {},
            commit: () => {},
          } as unknown as IDBTransaction;
        },
        createObjectStore: (name: string) => {
          if (!dbStores.has(dbName)) {
            dbStores.set(dbName, new Set());
          }
          dbStores.get(dbName)!.add(name);
          return createMockObjectStore(dbName, name);
        },
        close: () => {},
        onabort: null,
        onclose: null,
        onerror: null,
        onversionchange: null,
      } as unknown as IDBDatabase;

      const request = {
        result: mockDB,
        error: null,
        onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        onupgradeneeded: null as ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown) | null,
        readyState: 'done' as IDBRequestReadyState,
      };

      // Trigger onupgradeneeded if needed
      if (needsUpgrade) {
        const upgradeHandler = request.onupgradeneeded;
        if (upgradeHandler) {
          setTimeout(() => {
            const event = {
              target: request,
              currentTarget: request,
              type: 'upgradeneeded',
              bubbles: false,
              cancelable: false,
              defaultPrevented: false,
              eventPhase: 0,
              isTrusted: true,
              timeStamp: Date.now(),
              oldVersion: currentVersion - 1,
              newVersion: requestedVersion,
              cancelBubble: false,
              composed: false,
              returnValue: true,
              srcElement: request,
              stopPropagation: () => {},
              stopImmediatePropagation: () => {},
              preventDefault: () => {},
              initEvent: () => {},
              AT_TARGET: 2,
              BUBBLING_PHASE: 3,
              CAPTURING_PHASE: 1,
              NONE: 0,
            } as unknown as IDBVersionChangeEvent;
            upgradeHandler.call(request as unknown as IDBOpenDBRequest, event);
          }, 0);
        }
      }

      // Auto-resolve the request
      setTimeout(() => {
        if (request.onsuccess) {
          request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
        }
      }, 0);

      return request as IDBOpenDBRequest;
    },
    deleteDatabase: (dbName: string) => {
      dbStorage.delete(dbName);
      return createMockRequest(undefined);
    },
    cmp: (a: unknown, b: unknown) => {
      const aVal = a as number | string;
      const bVal = b as number | string;
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    },
  };

  Object.defineProperty(global, 'indexedDB', {
    value: mockIndexedDB,
    writable: true,
    configurable: true,
  });

  // Also add to window for browser-like environment
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'indexedDB', {
      value: mockIndexedDB,
      writable: true,
      configurable: true,
    });
  }
}
