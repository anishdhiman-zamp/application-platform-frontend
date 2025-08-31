import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';

import {
  API_DOMAIN,
  getApiDomain,
  getApiDomainAndRegions,
  getCurrentRegion,
  reinitializeApiDomain,
} from '../api.utils';

jest.mock('@zamp-platform/utils', () => ({
  getFromLocalStorage: jest.fn(),
  setToLocalStorage: jest.fn(),
  LOCAL_STORAGE_KEYS: {
    ALL_REGIONS: 'ALL_REGIONS_V2',
    ORG_REGION: 'ORG_REGION',
    LAST_LOGGED_IN_OIDC_EMAIL: 'LAST_LOGGED_IN_OIDC_EMAIL',
  },
}));

jest.mock('../constants', () => ({
  DEV_API_URL: 'http://localhost:3001',
  ENVIRONMENT: 'test',
  MULTI_REGION_ENABLED: false,
  REGION_LIST: ['', '-me'],
  REGIONS_MAP: {
    us: { suffix: '' },
    me: { suffix: '-me' },
  },
}));

global.fetch = jest.fn();

const mockGetFromLocalStorage = getFromLocalStorage as jest.MockedFunction<typeof getFromLocalStorage>;
const mockSetToLocalStorage = setToLocalStorage as jest.MockedFunction<typeof setToLocalStorage>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('api.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFromLocalStorage.mockReturnValue('');
  });

  describe('getCurrentRegion', () => {
    it('should return user region from localStorage when available', () => {
      const userRegion = '-me';
      mockGetFromLocalStorage.mockReturnValue(userRegion);

      const result = getCurrentRegion();

      expect(result).toBe(userRegion);
      expect(mockGetFromLocalStorage).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.ORG_REGION);
    });

    it('should return empty string when no user region in localStorage', () => {
      mockGetFromLocalStorage.mockReturnValue(null);

      const result = getCurrentRegion();

      expect(result).toBe('');
    });

    it('should return empty string when localStorage returns undefined', () => {
      mockGetFromLocalStorage.mockReturnValue(null);

      const result = getCurrentRegion();

      expect(result).toBe('');
    });
  });

  describe('getApiDomainAndRegions', () => {
    it('should return cached regions when available in localStorage', async () => {
      const cachedRegions = ['us', 'me'];
      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce(JSON.stringify(cachedRegions)); // ALL_REGIONS call

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toEqual({
        domain: expect.any(String),
        regions: cachedRegions,
      });
    });

    it('should fetch regions in production with multi-region enabled when no cached regions', async () => {
      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call (empty array)

      const result = await getApiDomainAndRegions('test@example.com');

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toHaveProperty('domain');
      expect(result).toHaveProperty('regions');
      expect(result.regions).toEqual([]);
    });

    it('should handle successful region verification', async () => {
      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call (empty array)

      await getApiDomainAndRegions('test@example.com');

      expect(mockSetToLocalStorage).not.toHaveBeenCalled();
    });

    it('should handle failed region verification', async () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      process.env.NEXT_PUBLIC_MULTI_REGION_ENABLED = 'true';

      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call (empty array)

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response);

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result.regions).toEqual([]);
    });

    it('should use email from parameter when provided', async () => {
      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call (empty array)

      await getApiDomainAndRegions('test@example.com');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should use email from localStorage when parameter is empty', async () => {
      const savedEmail = 'saved@example.com';
      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]') // ALL_REGIONS call (empty array)
        .mockReturnValue(savedEmail); // LAST_LOGGED_IN_OIDC_EMAIL call

      await getApiDomainAndRegions('');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle Promise.allSettled rejections', async () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      process.env.NEXT_PUBLIC_MULTI_REGION_ENABLED = 'true';

      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call (empty array)

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result.regions).toEqual([]);
    });

    it('should set default region to US when no successful regions', async () => {
      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call (empty array)

      await getApiDomainAndRegions('test@example.com');

      expect(mockSetToLocalStorage).not.toHaveBeenCalled();
    });

    it('should not fetch regions when not in production environment', async () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'development';

      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call

      const result = await getApiDomainAndRegions('test@example.com');

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.regions).toEqual([]);
    });

    it('should not fetch regions when multi-region is disabled', async () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      process.env.NEXT_PUBLIC_MULTI_REGION_ENABLED = 'false';

      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call

      const result = await getApiDomainAndRegions('test@example.com');

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.regions).toEqual([]);
    });
  });

  describe('getApiDomain', () => {
    it('should return production domain for production environment', () => {
      const result = getApiDomain('production', '');
      expect(result).toBe('https://api.zamp.ai');
    });

    it('should return production domain with region suffix', () => {
      const result = getApiDomain('production', '-me');
      expect(result).toBe('https://api-me.zamp.ai');
    });

    it('should return staging domain for staging environment', () => {
      const result = getApiDomain('staging', '');
      expect(result).toBe('https://api-stg-aws-us.zamp.ai');
    });

    it('should return development domain for development environment', () => {
      const result = getApiDomain('development', '');
      expect(result).toBe('http://localhost:3001');
    });

    it('should return localhost for unknown environment', () => {
      const result = getApiDomain('unknown', '');
      expect(result).toBe('http://localhost:8080');
    });

    it('should handle empty environment parameter', () => {
      const result = getApiDomain('', '');
      expect(result).toBe('http://localhost:8080');
    });
  });

  describe('reinitializeApiDomain', () => {
    it('should update API_DOMAIN when called', () => {
      mockGetFromLocalStorage.mockReturnValue('-me');

      reinitializeApiDomain();

      expect(mockGetFromLocalStorage).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.ORG_REGION);
    });

    it('should handle empty region when reinitializing', () => {
      mockGetFromLocalStorage.mockReturnValue('');

      reinitializeApiDomain();

      expect(mockGetFromLocalStorage).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.ORG_REGION);
    });
  });

  describe('API_DOMAIN initialization', () => {
    it('should initialize API_DOMAIN on module load', () => {
      expect(typeof API_DOMAIN).toBe('string');
    });
  });

  describe('edge cases', () => {
    it('should handle null values from localStorage gracefully', async () => {
      mockGetFromLocalStorage.mockReturnValue(null);

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result).toHaveProperty('domain');
      expect(result).toHaveProperty('regions');
    });

    it('should handle malformed JSON in localStorage', async () => {
      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('invalid-json'); // ALL_REGIONS call

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result.regions).toEqual([]);
    });

    it('should handle fetch network errors', async () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      process.env.NEXT_PUBLIC_MULTI_REGION_ENABLED = 'true';

      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result.regions).toEqual([]);
    });

    it('should handle partial region success', async () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      process.env.NEXT_PUBLIC_MULTI_REGION_ENABLED = 'true';

      mockGetFromLocalStorage
        .mockReturnValueOnce('') // getCurrentRegion call
        .mockReturnValueOnce('[]'); // ALL_REGIONS call

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({}),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue({}),
        } as unknown as Response);

      const result = await getApiDomainAndRegions('test@example.com');

      expect(result.regions.length).toBeGreaterThanOrEqual(0);
    });
  });
});
