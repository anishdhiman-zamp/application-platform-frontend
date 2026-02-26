import { captureException } from '@sentry/browser';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';

import { BASE_API_URL, DEFAULT_REGION, ENVIRONMENT, MULTI_REGION_ENABLED } from './constants';

function getSavedLoginEmail(): string {
  const info = getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGIN_INFO);
  if (info) {
    try {
      return JSON.parse(info)?.email ?? '';
    } catch {
      return '';
    }
  }
  return getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL);
}

export const getApiDomainAndRegions = async (email = '') => {
  const defaultRegions = [{ region: DEFAULT_REGION, url: BASE_API_URL }];
  let allRegions = defaultRegions;

  if (MULTI_REGION_ENABLED) {
    try {
      const apiBaseUrlsResponse = await fetch(`${getApiDomain(ENVIRONMENT)}/auth/api-base-url`, {
        method: 'POST',
        body: JSON.stringify({
          email: email || getSavedLoginEmail(),
        }),
      }).then((res) => res.json() as Promise<{ api_base_urls: { region: string; url: string }[] }>);
      const allRegionsResponse = apiBaseUrlsResponse.api_base_urls;
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
