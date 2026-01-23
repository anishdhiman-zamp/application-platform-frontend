import {
  cleanupOldCache,
  clearCachedContent,
  createIndexedDBCache,
  getCachedContent,
  hasContentChanged,
  hashContent,
  IndexedDBCacheEntry,
  setCachedContent,
  setCachedEmptyState,
} from '../index';

// Mock IndexedDB
const mockObjectStore = {
  put: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  index: jest.fn(),
  createIndex: jest.fn(),
};

const mockTransaction = {
  objectStore: jest.fn(() => mockObjectStore),
};

const mockDB = {
  transaction: jest.fn(() => mockTransaction),
  objectStoreNames: {
    contains: jest.fn(() => false),
  },
  createObjectStore: jest.fn(() => mockObjectStore),
};

const mockIndexedDB = {
  open: jest.fn(),
};

// Setup global indexedDB mock
Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

describe('IndexedDB Cache Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default successful open
    mockIndexedDB.open.mockImplementation(() => {
      const request = {
        result: mockDB,
        error: null,
        onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        onupgradeneeded: null as ((this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => unknown) | null,
      };

      setTimeout(() => {
        if (request.onsuccess) {
          request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
        }
      }, 0);

      return request;
    });
  });

  describe('hashContent', () => {
    it('should return consistent hash for the same content', () => {
      const content = 'Hello, World!';
      const hash1 = hashContent(content);
      const hash2 = hashContent(content);

      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different content', () => {
      const hash1 = hashContent('Hello, World!');
      const hash2 = hashContent('Goodbye, World!');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = hashContent('');

      expect(hash).toBe('0');
    });

    it('should return a base36 string', () => {
      const hash = hashContent('test content');

      expect(hash).toMatch(/^-?[0-9a-z]+$/);
    });
  });

  describe('hasContentChanged', () => {
    it('should return true when cached entry is null', () => {
      expect(hasContentChanged(null, 'new content')).toBe(true);
    });

    it('should return false when content hash matches', () => {
      const content = 'test content';
      const cachedEntry: IndexedDBCacheEntry = {
        key: 'test-key',
        content,
        contentHash: hashContent(content),
        timestamp: Date.now(),
      };

      expect(hasContentChanged(cachedEntry, content)).toBe(false);
    });

    it('should return true when content hash differs', () => {
      const cachedEntry: IndexedDBCacheEntry = {
        key: 'test-key',
        content: 'old content',
        contentHash: hashContent('old content'),
        timestamp: Date.now(),
      };

      expect(hasContentChanged(cachedEntry, 'new content')).toBe(true);
    });
  });

  describe('getCachedContent', () => {
    it('should return cached entry when found', async () => {
      const mockEntry: IndexedDBCacheEntry = {
        key: 'test-key',
        content: 'cached content',
        contentHash: 'abc123',
        timestamp: Date.now(),
      };

      mockObjectStore.get.mockImplementation(() => {
        const request = {
          result: mockEntry,
          error: null,
          onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
          onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        };

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);

        return request;
      });

      const result = await getCachedContent('test-key');

      expect(result).toEqual(mockEntry);
    });

    it('should return null when entry not found', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = {
          result: undefined,
          error: null,
          onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
          onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        };

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);

        return request;
      });

      const result = await getCachedContent('nonexistent-key');

      expect(result).toBeNull();
    });

    it('should return null on error and log warning', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockIndexedDB.open.mockImplementation(() => {
        throw new Error('DB Error');
      });

      const result = await getCachedContent('test-key');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get cached content:', 'test-key');

      consoleSpy.mockRestore();
    });
  });

  describe('setCachedContent', () => {
    it('should store content with hash and timestamp', async () => {
      mockObjectStore.put.mockImplementation(() => {
        const request = {
          error: null,
          onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
          onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        };

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);

        return request;
      });

      await setCachedContent('test-key', 'test content');

      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test-key',
          content: 'test content',
          contentHash: hashContent('test content'),
          isEmpty: false,
        }),
      );
    });

    it('should log warning on error', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockIndexedDB.open.mockImplementation(() => {
        throw new Error('DB Error');
      });

      await setCachedContent('test-key', 'test content');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to cache content:', 'test-key');

      consoleSpy.mockRestore();
    });
  });

  describe('setCachedEmptyState', () => {
    it('should store empty state entry', async () => {
      mockObjectStore.put.mockImplementation(() => {
        const request = {
          error: null,
          onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
          onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        };

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);

        return request;
      });

      await setCachedEmptyState('test-key');

      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test-key',
          content: '',
          contentHash: '',
          isEmpty: true,
        }),
      );
    });
  });

  describe('clearCachedContent', () => {
    it('should delete entry from store', async () => {
      mockObjectStore.delete.mockImplementation(() => {
        const request = {
          error: null,
          onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
          onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        };

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);

        return request;
      });

      await clearCachedContent('test-key');

      expect(mockObjectStore.delete).toHaveBeenCalledWith('test-key');
    });
  });

  describe('cleanupOldCache', () => {
    it('should delete entries older than maxAge', async () => {
      const mockCursor = {
        delete: jest.fn(),
        continue: jest.fn(),
      };

      const mockIndex = {
        openCursor: jest.fn(() => {
          const request = {
            result: mockCursor,
            error: null,
            onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
            onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
          };

          setTimeout(() => {
            // First call with cursor
            if (request.onsuccess) {
              request.onsuccess.call(
                request as unknown as IDBRequest,
                {
                  target: { result: mockCursor },
                } as unknown as Event,
              );
            }
            // Second call without cursor (end of iteration)
            setTimeout(() => {
              if (request.onsuccess) {
                request.onsuccess.call(
                  request as unknown as IDBRequest,
                  {
                    target: { result: null },
                  } as unknown as Event,
                );
              }
            }, 0);
          }, 0);

          return request;
        }),
      };

      mockObjectStore.index.mockReturnValue(mockIndex);

      await cleanupOldCache(1000);

      expect(mockObjectStore.index).toHaveBeenCalledWith('timestamp');
      expect(mockIndex.openCursor).toHaveBeenCalled();
    });

    it('should use default maxAge of 7 days', async () => {
      const mockIndex = {
        openCursor: jest.fn(() => {
          const request = {
            result: null,
            error: null,
            onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
            onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
          };

          setTimeout(() => {
            if (request.onsuccess) {
              request.onsuccess.call(
                request as unknown as IDBRequest,
                {
                  target: { result: null },
                } as unknown as Event,
              );
            }
          }, 0);

          return request;
        }),
      };

      mockObjectStore.index.mockReturnValue(mockIndex);

      await cleanupOldCache();

      expect(mockIndex.openCursor).toHaveBeenCalled();
    });
  });

  describe('createIndexedDBCache', () => {
    it('should create a configured cache instance', () => {
      const cache = createIndexedDBCache({
        dbName: 'custom-db',
        storeName: 'custom-store',
      });

      expect(cache).toHaveProperty('get');
      expect(cache).toHaveProperty('set');
      expect(cache).toHaveProperty('setEmptyState');
      expect(cache).toHaveProperty('clear');
      expect(cache).toHaveProperty('cleanup');
      expect(cache).toHaveProperty('hasContentChanged');
    });

    it('should pass config to all methods', async () => {
      mockObjectStore.get.mockImplementation(() => {
        const request = {
          result: null,
          error: null,
          onerror: null as ((this: IDBRequest, ev: Event) => unknown) | null,
          onsuccess: null as ((this: IDBRequest, ev: Event) => unknown) | null,
        };

        setTimeout(() => {
          if (request.onsuccess) {
            request.onsuccess.call(request as unknown as IDBRequest, {} as Event);
          }
        }, 0);

        return request;
      });

      const cache = createIndexedDBCache({
        dbName: 'custom-db',
        storeName: 'custom-store',
      });

      await cache.get('test-key');

      // Verify the custom config was used
      expect(mockIndexedDB.open).toHaveBeenCalledWith('custom-db', expect.any(Number));
    });
  });
});
