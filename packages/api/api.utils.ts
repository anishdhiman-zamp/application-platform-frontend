import { captureException } from '@sentry/browser';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';

import { BASE_API_URL, ENVIRONMENT } from './constants';

export const getApiDomainAndRegions = async (email = '') => {
  const defaultRegions = [{ region: 'us', url: BASE_API_URL }];
  let allRegions = defaultRegions;
  let hasCachedRegions = false;

  try {
    const cachedRegions = JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.ALL_REGIONS) || '[]');
    if (cachedRegions.length > 0) {
      allRegions = cachedRegions;
      hasCachedRegions = true;
    }
  } catch {
    console.warn('Error parsing all regions from localstorage');
  }

  if (!hasCachedRegions) {
    try {
      const apiBaseUrlsResponse = await fetch(`${getApiDomain(ENVIRONMENT)}/auth/api-base-url`, {
        method: 'POST',
        body: JSON.stringify({
          email: email ? email : getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL),
        }),
      }).then((res) => res.json() as Promise<{ api_base_urls: { region: string; url: string }[] }>);
      const allRegionsResponse = apiBaseUrlsResponse.api_base_urls;
      setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, JSON.stringify(allRegionsResponse[0]));
      setToLocalStorage(LOCAL_STORAGE_KEYS.ALL_REGIONS, JSON.stringify(allRegionsResponse));
      allRegions = allRegionsResponse;
      reinitializeApiDomain(allRegionsResponse[0].url);
    } catch (error) {
      captureException(error);
      // Return default regions when API call fails
      allRegions = defaultRegions;
    }

    return allRegions;
  }

  return allRegions;
};

export const getApiDomain = (environment = '') => {
  console.log('environment', environment);
  switch (environment) {
    case 'production':
    case 'staging':
    case 'development':
      return BASE_API_URL;
    default:
      return 'http://localhost:8080';
  }
};

export let API_DOMAIN = getApiDomain(ENVIRONMENT);

export const reinitializeApiDomain = (url: string) => {
  API_DOMAIN = url;
};
