import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';

import { API_DOMAIN, getApiDomain, getApiDomainAndRegions, reinitializeApiDomain } from '../api.utils';
import { BASE_API_URL } from '../constants';

jest.mock('@zamp-platform/utils', () => ({
  getFromLocalStorage: jest.fn(),
  setToLocalStorage: jest.fn(),
  LOCAL_STORAGE_KEYS: {
    ALL_REGIONS: 'ALL_REGIONS_V3',
    ORG_REGION: 'ORG_REGION',
    LAST_LOGGED_IN_OIDC_EMAIL: 'LAST_LOGGED_IN_OIDC_EMAIL',
  },
}));

jest.mock('../constants', () => ({
  BASE_API_URL: 'http://localhost:3001',
  ENVIRONMENT: 'development',
}));

global.fetch = jest.fn();

const mockGetFromLocalStorage = getFromLocalStorage as jest.MockedFunction<typeof getFromLocalStorage>;
const mockSetToLocalStorage = setToLocalStorage as jest.MockedFunction<typeof setToLocalStorage>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('api.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFromLocalStorage.mockReturnValue('[]');
  });

  describe('getApiDomainAndRegions', () => {
    it('should return cached regions when available in localStorage', async () => {
      const cachedRegions = [
        { region: 'us', url: 'https://api-us.zamp.ai' },
        { region: 'me', url: 'https://api-me.zamp.ai' },
      ];
      mockGetFromLocalStorage.mockReturnValue(JSON.stringify(cachedRegions));

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual(cachedRegions);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return default region when no cached regions and API call fails', async () => {
      mockGetFromLocalStorage.mockReturnValue('[]');
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual([{ region: 'us', url: BASE_API_URL }]);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should fetch regions from API when no cached regions', async () => {
      const mockApiResponse = {
        api_base_urls: [
          {
            region: 'us',
            url: 'https://api-us.zamp.ai',
          },
          {
            region: 'me',
            url: 'https://api-me.zamp.ai',
          },
        ],
      };

      mockGetFromLocalStorage.mockReturnValue('[]');
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      } as unknown as Response);

      const result = await getApiDomainAndRegions('test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_API_URL}/auth/api-base-url`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
      );
      // The function now properly returns the fetched regions
      expect(result).toEqual([
        { region: 'us', url: 'https://api-us.zamp.ai' },
        { region: 'me', url: 'https://api-me.zamp.ai' },
      ]);
      // And it saves the data to localStorage
      expect(mockSetToLocalStorage).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEYS.ORG_REGION,
        JSON.stringify({ region: 'us', url: 'https://api-us.zamp.ai' }),
      );
      expect(mockSetToLocalStorage).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEYS.ALL_REGIONS,
        JSON.stringify([
          { region: 'us', url: 'https://api-us.zamp.ai' },
          { region: 'me', url: 'https://api-me.zamp.ai' },
        ]),
      );
    });

    it('should use email from localStorage when parameter is empty', async () => {
      const savedEmail = 'saved@example.com';
      const mockApiResponse = {
        api_base_urls: [
          {
            region: 'us',
            url: 'https://api-us.zamp.ai',
          },
          {
            region: 'me',
            url: 'https://api-me.zamp.ai',
          },
        ],
      };

      mockGetFromLocalStorage
        .mockReturnValueOnce('[]') // ALL_REGIONS call
        .mockReturnValue(savedEmail); // LAST_LOGGED_IN_OIDC_EMAIL call
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      } as unknown as Response);

      await getApiDomainAndRegions('');

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_API_URL}/auth/api-base-url`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: savedEmail }),
        }),
      );
    });

    it('should handle API fetch errors gracefully', async () => {
      mockGetFromLocalStorage.mockReturnValue('[]');
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual([{ region: 'us', url: BASE_API_URL }]);
      expect(mockSetToLocalStorage).not.toHaveBeenCalled();
    });

    it('should handle malformed JSON in localStorage', async () => {
      mockGetFromLocalStorage.mockReturnValue('invalid-json');

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual([{ region: 'us', url: BASE_API_URL }]);
    });
  });

  describe('getApiDomain', () => {
    it('should return BASE_API_URL for production environment', () => {
      const result = getApiDomain('production');
      expect(result).toBe(BASE_API_URL);
    });

    it('should return BASE_API_URL for staging environment', () => {
      const result = getApiDomain('staging');
      expect(result).toBe(BASE_API_URL);
    });

    it('should return BASE_API_URL for development environment', () => {
      const result = getApiDomain('development');
      expect(result).toBe(BASE_API_URL);
    });

    it('should return localhost for unknown environment', () => {
      const result = getApiDomain('unknown');
      expect(result).toBe('http://localhost:8080');
    });

    it('should handle empty environment parameter', () => {
      const result = getApiDomain('');
      expect(result).toBe('http://localhost:8080');
    });
  });

  describe('reinitializeApiDomain', () => {
    it('should update API_DOMAIN when called', () => {
      reinitializeApiDomain('https://api-me.zamp.ai');

      expect(API_DOMAIN).toBe('https://api-me.zamp.ai');
    });

    it('should handle API_DOMAIN region when reinitializing', () => {
      reinitializeApiDomain('https://api-us.zamp.ai');

      expect(API_DOMAIN).toBe('https://api-us.zamp.ai');
    });
  });

  describe('API_DOMAIN initialization', () => {
    it('should initialize API_DOMAIN on module load', () => {
      expect(typeof API_DOMAIN).toBe('string');
    });
  });

  describe('edge cases', () => {
    it('should handle null values from localStorage gracefully', async () => {
      mockGetFromLocalStorage.mockReturnValue('');
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual([{ region: 'us', url: BASE_API_URL }]);
    });

    it('should handle API response with empty regions', async () => {
      const mockApiResponse = {
        api_base_urls: [],
      };

      mockGetFromLocalStorage.mockReturnValue('[]');
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      } as unknown as Response);

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual([{ region: 'us', url: BASE_API_URL }]);
    });

    it('should handle API response with invalid structure', async () => {
      mockGetFromLocalStorage.mockReturnValue('[]');
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ invalid: 'structure' }),
      } as unknown as Response);

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual([{ region: 'us', url: BASE_API_URL }]);
    });
  });
});
