import '@jest/globals';

import {
  cleanupOldCache,
  clearAllCache,
  clearCachedContent,
  createOPFSCache,
  getCachedContent,
  hasContentChanged,
  hashContent,
  isOPFSAvailable,
  OPFSCacheEntry,
  setCachedContent,
  setCachedEmptyState,
} from '../index';

// Mock OPFS APIs
const mockWritable = {
  write: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockFileHandle = {
  getFile: jest.fn(),
  createWritable: jest.fn().mockResolvedValue(mockWritable),
};

const mockDirectoryHandle = {
  getFileHandle: jest.fn(),
  removeEntry: jest.fn().mockResolvedValue(undefined),
  [Symbol.asyncIterator]: jest.fn(),
};

const mockRootHandle = {
  getDirectoryHandle: jest.fn().mockResolvedValue(mockDirectoryHandle),
};

// Setup global navigator.storage mock
const mockStorage = {
  getDirectory: jest.fn().mockResolvedValue(mockRootHandle),
};

Object.defineProperty(global, 'navigator', {
  value: {
    storage: mockStorage,
  },
  writable: true,
});

describe('OPFS Cache Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDirectoryHandle.getFileHandle.mockResolvedValue(mockFileHandle);
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

  describe('isOPFSAvailable', () => {
    it('should return true when OPFS is available', () => {
      expect(isOPFSAvailable()).toBe(true);
    });

    it('should return false when navigator.storage is undefined', () => {
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      expect(isOPFSAvailable()).toBe(false);

      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });
  });

  describe('hasContentChanged', () => {
    it('should return true when cached entry is null', () => {
      expect(hasContentChanged(null, 'new content')).toBe(true);
    });

    it('should return false when content hash matches', () => {
      const content = 'test content';
      const cachedEntry: OPFSCacheEntry = {
        key: 'test-key',
        content,
        contentHash: hashContent(content),
        timestamp: Date.now(),
      };

      expect(hasContentChanged(cachedEntry, content)).toBe(false);
    });

    it('should return true when content hash differs', () => {
      const cachedEntry: OPFSCacheEntry = {
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
      const mockEntry: OPFSCacheEntry = {
        key: 'test-key',
        content: 'cached content',
        contentHash: 'abc123',
        timestamp: Date.now(),
      };

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockEntry)),
      };

      mockFileHandle.getFile.mockResolvedValue(mockFile);

      const result = await getCachedContent('test-key');

      expect(result).toEqual(mockEntry);
    });

    it('should return null when entry not found', async () => {
      const notFoundError = new Error('File not found');
      notFoundError.name = 'NotFoundError';
      mockDirectoryHandle.getFileHandle.mockRejectedValue(notFoundError);

      const result = await getCachedContent('nonexistent-key');

      expect(result).toBeNull();
    });

    it('should return null on error and log warning', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockDirectoryHandle.getFileHandle.mockRejectedValue(new Error('Read Error'));

      const result = await getCachedContent('test-key');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('[OPFS] Failed to get cached content:', 'test-key');

      consoleSpy.mockRestore();
    });
  });

  describe('setCachedContent', () => {
    it('should store content with hash and timestamp', async () => {
      mockDirectoryHandle.getFileHandle.mockResolvedValue(mockFileHandle);

      await setCachedContent('test-key', 'test content');

      expect(mockWritable.write).toHaveBeenCalledWith(expect.stringContaining('"key":"test-key"'));
      expect(mockWritable.write).toHaveBeenCalledWith(expect.stringContaining('"content":"test content"'));
      expect(mockWritable.write).toHaveBeenCalledWith(expect.stringContaining('"isEmpty":false'));
      expect(mockWritable.close).toHaveBeenCalled();
    });

    it('should log warning on error', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockDirectoryHandle.getFileHandle.mockRejectedValue(new Error('Write Error'));

      await setCachedContent('test-key', 'test content');

      expect(consoleSpy).toHaveBeenCalledWith('[OPFS] Failed to cache content:', 'test-key');

      consoleSpy.mockRestore();
    });
  });

  describe('setCachedEmptyState', () => {
    it('should store empty state entry', async () => {
      mockDirectoryHandle.getFileHandle.mockResolvedValue(mockFileHandle);

      await setCachedEmptyState('test-key');

      expect(mockWritable.write).toHaveBeenCalledWith(expect.stringContaining('"isEmpty":true'));
      expect(mockWritable.write).toHaveBeenCalledWith(expect.stringContaining('"content":""'));
      expect(mockWritable.close).toHaveBeenCalled();
    });
  });

  describe('clearCachedContent', () => {
    it('should delete entry from store', async () => {
      await clearCachedContent('test-key');

      expect(mockDirectoryHandle.removeEntry).toHaveBeenCalledWith('test-key.json');
    });

    it('should not log warning for NotFoundError', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const notFoundError = new Error('Not found');
      notFoundError.name = 'NotFoundError';
      mockDirectoryHandle.removeEntry.mockRejectedValue(notFoundError);

      await clearCachedContent('test-key');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('cleanupOldCache', () => {
    it('should delete entries older than maxAge', async () => {
      const oldEntry: OPFSCacheEntry = {
        key: 'old-key',
        content: 'old content',
        contentHash: 'hash',
        timestamp: Date.now() - 2000, // 2 seconds ago
      };

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(oldEntry)),
      };

      mockFileHandle.getFile.mockResolvedValue(mockFile);

      // Mock async iterator for directory entries
      const entries: [string, FileSystemHandle][] = [['old-key.json', mockFileHandle as unknown as FileSystemHandle]];
      mockDirectoryHandle[Symbol.asyncIterator] = jest.fn().mockReturnValue({
        async next() {
          const entry = entries.shift();
          return entry ? { value: entry, done: false } : { value: undefined, done: true };
        },
      });

      await cleanupOldCache(1000); // 1 second maxAge

      expect(mockDirectoryHandle.removeEntry).toHaveBeenCalledWith('old-key.json');
    });

    it('should not delete fresh entries', async () => {
      const freshEntry: OPFSCacheEntry = {
        key: 'fresh-key',
        content: 'fresh content',
        contentHash: 'hash',
        timestamp: Date.now(), // Now
      };

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(freshEntry)),
      };

      mockFileHandle.getFile.mockResolvedValue(mockFile);

      // Mock async iterator for directory entries
      const entries: [string, FileSystemHandle][] = [['fresh-key.json', mockFileHandle as unknown as FileSystemHandle]];
      mockDirectoryHandle[Symbol.asyncIterator] = jest.fn().mockReturnValue({
        async next() {
          const entry = entries.shift();
          return entry ? { value: entry, done: false } : { value: undefined, done: true };
        },
      });

      await cleanupOldCache(1000); // 1 second maxAge

      expect(mockDirectoryHandle.removeEntry).not.toHaveBeenCalled();
    });
  });

  describe('clearAllCache', () => {
    it('should delete all entries', async () => {
      // Mock async iterator for directory entries
      const entries: [string, FileSystemHandle][] = [
        ['key1.json', mockFileHandle as unknown as FileSystemHandle],
        ['key2.json', mockFileHandle as unknown as FileSystemHandle],
      ];
      mockDirectoryHandle[Symbol.asyncIterator] = jest.fn().mockReturnValue({
        async next() {
          const entry = entries.shift();
          return entry ? { value: entry, done: false } : { value: undefined, done: true };
        },
      });

      await clearAllCache();

      expect(mockDirectoryHandle.removeEntry).toHaveBeenCalledWith('key1.json');
      expect(mockDirectoryHandle.removeEntry).toHaveBeenCalledWith('key2.json');
    });
  });

  describe('createOPFSCache', () => {
    it('should create a configured cache instance', () => {
      const cache = createOPFSCache({
        directory: 'custom-directory',
      });

      expect(cache).toHaveProperty('get');
      expect(cache).toHaveProperty('set');
      expect(cache).toHaveProperty('setEmptyState');
      expect(cache).toHaveProperty('clear');
      expect(cache).toHaveProperty('clearAll');
      expect(cache).toHaveProperty('cleanup');
      expect(cache).toHaveProperty('hasContentChanged');
      expect(cache).toHaveProperty('isAvailable');
    });

    it('should pass config to all methods', async () => {
      const mockEntry: OPFSCacheEntry = {
        key: 'test-key',
        content: 'cached content',
        contentHash: 'abc123',
        timestamp: Date.now(),
      };

      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockEntry)),
      };

      mockFileHandle.getFile.mockResolvedValue(mockFile);

      const cache = createOPFSCache({
        directory: 'custom-directory',
      });

      await cache.get('test-key');

      // Verify the custom config was used
      expect(mockRootHandle.getDirectoryHandle).toHaveBeenCalledWith('custom-directory', { create: true });
    });
  });
});
