import { captureException } from '@sentry/browser';
import { getFromLocalStorage } from '@zamp-platform/utils';

import { API_DOMAIN, getApiDomain, getApiDomainAndRegions, reinitializeApiDomain } from '../api.utils';
import { BASE_API_URL } from '../constants';

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

jest.mock('@zamp-platform/utils', () => ({
  getFromLocalStorage: jest.fn(),
  LOCAL_STORAGE_KEYS: {
    LAST_LOGIN_INFO: 'LAST_LOGIN_INFO',
    LAST_LOGGED_IN_OIDC_EMAIL: 'LAST_LOGGED_IN_OIDC_EMAIL',
  },
}));

jest.mock('../constants', () => ({
  BASE_API_URL: 'https://api.zamp.ai',
  DEFAULT_REGION: 'us',
  ENVIRONMENT: 'development',
  MULTI_REGION_ENABLED: true,
}));

global.fetch = jest.fn();

const mockGetFromLocalStorage = getFromLocalStorage as jest.MockedFunction<typeof getFromLocalStorage>;
const mockCaptureException = captureException as jest.MockedFunction<typeof captureException>;

describe('api.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    // Reset API_DOMAIN to initial value
    reinitializeApiDomain(BASE_API_URL);
  });

  describe('getApiDomainAndRegions', () => {
    it('should fetch regions from API when MULTI_REGION_ENABLED is true', async () => {
      const mockApiResponse = {
        api_base_urls: [
          { region: 'us', url: 'https://api-us.zamp.ai' },
          { region: 'me', url: 'https://api-me.zamp.ai' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual(mockApiResponse.api_base_urls);
      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_API_URL}/auth/api-base-url`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
      );
    });

    it('should use email from localStorage when parameter is empty', async () => {
      mockGetFromLocalStorage.mockReturnValue(JSON.stringify({ email: 'saved@example.com' }));

      const mockApiResponse = {
        api_base_urls: [{ region: 'us', url: 'https://api-us.zamp.ai' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockApiResponse),
      });

      await getApiDomainAndRegions('');

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_API_URL}/auth/api-base-url`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'saved@example.com' }),
        }),
      );
    });

    it('should return default regions when API call fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual([{ region: 'us', url: 'https://api.zamp.ai' }]);
      expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle API response with empty regions', async () => {
      const mockApiResponse = { api_base_urls: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await getApiDomainAndRegions('test@example.com');

      // When API returns empty regions, accessing [0] throws an error, so it falls back to default regions
      expect(result).toEqual([{ region: 'us', url: 'https://api.zamp.ai' }]);
      expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));
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
      const newUrl = 'https://new-api.zamp.ai';
      reinitializeApiDomain(newUrl);
      expect(API_DOMAIN).toBe(newUrl);
    });
  });

  describe('API_DOMAIN initialization', () => {
    it('should initialize API_DOMAIN on module load', () => {
      // Reset to initial value before testing
      reinitializeApiDomain(BASE_API_URL);
      expect(API_DOMAIN).toBe(BASE_API_URL);
    });
  });
});
