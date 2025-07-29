import { CacheStore, GlobalCacheStore } from '../index';

describe('Cache Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('CacheStore', () => {
    describe('basic operations', () => {
      let cache: CacheStore;

      beforeEach(() => {
        cache = new CacheStore({ expiryTime: 5000 });
      });

      it('should store and retrieve data', () => {
        const testData = { name: 'test', value: 123 };
        cache.set('key1', testData);

        expect(cache.get('key1')).toEqual(testData);
        expect(cache.has('key1')).toBe(true);
        expect(cache.size()).toBe(1);
      });

      it('should return null for non-existent keys', () => {
        expect(cache.get('nonexistent')).toBe(null);
      });

      it('should handle expiry correctly', () => {
        cache.set('key1', 'value1');
        jest.advanceTimersByTime(6000); // After expiry

        expect(cache.get('key1')).toBe(null);
        expect(cache.has('key1')).toBe(false);
      });

      it('should remove oldest entry when max size reached', () => {
        const smallCache = new CacheStore({ maxSize: 2 });
        smallCache.set('key1', 'value1');
        smallCache.set('key2', 'value2');
        smallCache.set('key3', 'value3');

        expect(smallCache.size()).toBe(2);
        expect(smallCache.get('key1')).toBe(null);
      });

      it('should handle edge case when maxSize is 1', () => {
        const singleItemCache = new CacheStore({ maxSize: 1 });

        // Add first item
        singleItemCache.set('key1', 'value1');
        expect(singleItemCache.size()).toBe(1);
        expect(singleItemCache.get('key1')).toBe('value1');

        // Add second item - should evict first
        singleItemCache.set('key2', 'value2');
        expect(singleItemCache.size()).toBe(1);
        expect(singleItemCache.get('key1')).toBe(null);
        expect(singleItemCache.get('key2')).toBe('value2');

        // Add third item - should evict second
        singleItemCache.set('key3', 'value3');
        expect(singleItemCache.size()).toBe(1);
        expect(singleItemCache.get('key2')).toBe(null);
        expect(singleItemCache.get('key3')).toBe('value3');
      });

      it('should delete keys correctly', () => {
        cache.set('key1', 'value1');
        cache.delete('key1');

        expect(cache.get('key1')).toBe(null);
      });

      it('should clear all entries', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.clear();

        expect(cache.size()).toBe(0);
      });

      it('should cleanup expired entries', () => {
        cache.set('key1', 'value1');
        jest.advanceTimersByTime(6000);
        cache.cleanup();

        expect(cache.size()).toBe(0);
      });
    });
  });

  describe('GlobalCacheStore', () => {
    beforeEach(() => {
      GlobalCacheStore.clear();
    });

    it('should be an instance of CacheStore', () => {
      expect(GlobalCacheStore).toBeInstanceOf(CacheStore);
    });

    it('should maintain state across calls', () => {
      GlobalCacheStore.set('global-key', 'global-value');
      expect(GlobalCacheStore.get('global-key')).toBe('global-value');
    });
  });
});
