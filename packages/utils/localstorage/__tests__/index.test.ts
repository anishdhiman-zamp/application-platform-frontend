import { getFromLocalStorage, LOCAL_STORAGE_KEYS, removeFromLocalStorage, setToLocalStorage } from '../index';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('LocalStorage Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('LOCAL_STORAGE_KEYS', () => {
    it('should contain all expected keys', () => {
      const expectedKeys = [
        'XZAMP_GOD_MODE',
        'XZAMP_USER',
        'XZAMP_WORKSPACE_ID',
        'DATE_PLACEHOLDER_SEEN',
        'DATA_SHEET_ID',
        'WIDGET_INSTANCE_ID',
        'LAST_LOGGED_IN_OIDC_EMAIL',
        'LAST_VISITED_PAGE_ID',
        'COLUMN_ORDERING_VISIBILITY',
        'XZAMP_ORGANIZATION_ID',
        'ORG_REGION',
        'ALL_REGIONS',
      ];

      expectedKeys.forEach((key) => {
        expect(LOCAL_STORAGE_KEYS).toHaveProperty(key);
      });
    });

    it('should have correct key values', () => {
      expect(LOCAL_STORAGE_KEYS.XZAMP_GOD_MODE).toBe('XZAMP_GOD_MODE');
      expect(LOCAL_STORAGE_KEYS.XZAMP_USER).toBe('TMS_XZAMP_USER');
      expect(LOCAL_STORAGE_KEYS.XZAMP_WORKSPACE_ID).toBe('XZAMP_WORKSPACE_ID');
      expect(LOCAL_STORAGE_KEYS.DATE_PLACEHOLDER_SEEN).toBe('DATE_PLACEHOLDER_SEEN');
      expect(LOCAL_STORAGE_KEYS.DATA_SHEET_ID).toBe('DATA_SHEET_ID');
      expect(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID).toBe('WIDGET_INSTANCE_ID');
      expect(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL).toBe('LAST_LOGGED_IN_OIDC_EMAIL');
      expect(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE_ID).toBe('LAST_VISITED_PAGE_ID');
      expect(LOCAL_STORAGE_KEYS.COLUMN_ORDERING_VISIBILITY).toBe('COLUMNS_ORDER_VISIBILITY');
      expect(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID).toBe('X-Zamp-Organization-Id');
      expect(LOCAL_STORAGE_KEYS.ORG_REGION).toBe('ORG_REGION_V5');
      expect(LOCAL_STORAGE_KEYS.ALL_REGIONS).toBe('ALL_REGIONS_V4');
    });

    it('should maintain backward compatibility with existing key values', () => {
      // These tests ensure that existing key values don't change
      expect(LOCAL_STORAGE_KEYS.XZAMP_USER).toBe('TMS_XZAMP_USER');
      expect(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID).toBe('X-Zamp-Organization-Id');
      expect(LOCAL_STORAGE_KEYS.ORG_REGION).toBe('ORG_REGION_V5');
    });
  });

  describe('getFromLocalStorage', () => {
    it('should return value from localStorage', () => {
      const testValue = 'test-value';
      mockLocalStorage.getItem.mockReturnValue(testValue);

      const result = getFromLocalStorage('test-key');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe(testValue);
    });

    it('should return empty string when key does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getFromLocalStorage('non-existent-key');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('non-existent-key');
      expect(result).toBe('');
    });

    it('should return empty string when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const result = getFromLocalStorage('test-key');

      expect(result).toBe('');
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'key-with-special@#$%^&*()characters';
      const testValue = 'special-value';
      mockLocalStorage.getItem.mockReturnValue(testValue);

      const result = getFromLocalStorage(specialKey);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(specialKey);
      expect(result).toBe(testValue);
    });

    it('should handle empty string values', () => {
      mockLocalStorage.getItem.mockReturnValue('');

      const result = getFromLocalStorage('empty-key');

      expect(result).toBe('');
    });

    it('should work with all predefined LOCAL_STORAGE_KEYS', () => {
      Object.values(LOCAL_STORAGE_KEYS).forEach((key) => {
        mockLocalStorage.getItem.mockReturnValue(`value-for-${key}`);

        const result = getFromLocalStorage(key);

        expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
        expect(result).toBe(`value-for-${key}`);
      });
    });
  });

  describe('setToLocalStorage', () => {
    it('should set value to localStorage with predefined key', () => {
      const testValue = 'test-value';

      setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_USER, testValue);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.XZAMP_USER, testValue);
    });

    it('should handle empty string values', () => {
      setToLocalStorage(LOCAL_STORAGE_KEYS.DATA_SHEET_ID, '');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.DATA_SHEET_ID, '');
    });

    it('should handle special characters in values', () => {
      const specialValue = 'value-with-special@#$%^&*()characters';

      setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_WORKSPACE_ID, specialValue);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.XZAMP_WORKSPACE_ID, specialValue);
    });

    it('should work with all predefined LOCAL_STORAGE_KEYS', () => {
      Object.values(LOCAL_STORAGE_KEYS).forEach((key, index) => {
        const testValue = `test-value-${index}`;

        setToLocalStorage(key as LOCAL_STORAGE_KEYS, testValue);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, testValue);
      });
    });

    it('should handle JSON string values', () => {
      const jsonValue = JSON.stringify({ user: 'test', id: 123 });

      setToLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_USER, jsonValue);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.XZAMP_USER, jsonValue);
    });

    it('should maintain backward compatibility with function signature', () => {
      // Test that the function still works with the exact same parameters as before
      setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE_ID, 'page-123');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.LAST_VISITED_PAGE_ID, 'page-123');
    });
  });

  describe('removeFromLocalStorage', () => {
    it('should remove key from localStorage', () => {
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_USER);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.XZAMP_USER);
    });

    it('should work with all predefined LOCAL_STORAGE_KEYS', () => {
      Object.values(LOCAL_STORAGE_KEYS).forEach((key) => {
        removeFromLocalStorage(key as LOCAL_STORAGE_KEYS);

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
      });
    });

    it('should handle removing non-existent keys gracefully', () => {
      // This should not throw an error
      expect(() => {
        removeFromLocalStorage(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID);
      }).not.toThrow();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID);
    });

    it('should maintain backward compatibility with function signature', () => {
      // Test that the function still works with the exact same parameters as before
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.DATE_PLACEHOLDER_SEEN);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.DATE_PLACEHOLDER_SEEN);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: set, get, remove', () => {
      const testKey = LOCAL_STORAGE_KEYS.XZAMP_WORKSPACE_ID;
      const testValue = 'workspace-123';

      // Mock the localStorage behavior
      let storedValue: string | null = null;
      mockLocalStorage.setItem.mockImplementation((key, value) => {
        if (key === testKey) storedValue = value;
      });
      mockLocalStorage.getItem.mockImplementation((key) => {
        return key === testKey ? storedValue : null;
      });
      mockLocalStorage.removeItem.mockImplementation((key) => {
        if (key === testKey) storedValue = null;
      });

      // Set value
      setToLocalStorage(testKey, testValue);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, testValue);

      // Get value
      const retrievedValue = getFromLocalStorage(testKey);
      expect(retrievedValue).toBe(testValue);

      // Remove value
      removeFromLocalStorage(testKey);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(testKey);

      // Verify removal
      const removedValue = getFromLocalStorage(testKey);
      expect(removedValue).toBe('');
    });

    it('should handle concurrent operations', () => {
      const operations = [
        { key: LOCAL_STORAGE_KEYS.XZAMP_USER, value: 'user-data' },
        { key: LOCAL_STORAGE_KEYS.XZAMP_WORKSPACE_ID, value: 'workspace-data' },
        { key: LOCAL_STORAGE_KEYS.DATA_SHEET_ID, value: 'sheet-data' },
      ];

      operations.forEach(({ key, value }) => {
        setToLocalStorage(key, value);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value);
      });

      operations.forEach(({ key }) => {
        getFromLocalStorage(key);
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
      });
    });

    it('should maintain type safety with LOCAL_STORAGE_KEYS enum', () => {
      // This test ensures that only valid enum values can be used
      const validKey = LOCAL_STORAGE_KEYS.XZAMP_GOD_MODE;

      expect(() => {
        setToLocalStorage(validKey, 'true');
        removeFromLocalStorage(validKey);
      }).not.toThrow();
    });
  });
});
