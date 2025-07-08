import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';

import { ENVIRONMENT, MULTI_REGION_ENABLED, REGION_LIST } from './constants';

export const getApiDomainByRegion = async (email = '') => {
  const region = getUserRegion();

  if (ENVIRONMENT === 'production' && !region && MULTI_REGION_ENABLED) {
    const apiDomains = await Promise.allSettled(
      REGION_LIST.map(async (region) => {
        return fetch(`${getApiDomain(ENVIRONMENT, region)}/auth/verify/email`, {
          method: 'POST',
          body: JSON.stringify({
            email: email ? email : getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL),
          }),
        }).then((res) => ({
          region,
          status: res.status,
        }));
      }),
    );

    const successfulRegion = apiDomains
      .filter(
        (result): result is PromiseFulfilledResult<{ region: string; status: number }> => result.status === 'fulfilled',
      )
      .find((result) => result.value.status === 200)?.value.region;

    setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, successfulRegion ?? '');
    reinitializeApiDomain();

    return getApiDomain(ENVIRONMENT, successfulRegion ?? '');
  }

  return getApiDomain(ENVIRONMENT, region);
};

const getApiDomain = (environment = '', region = '') => {
  switch (environment) {
    case 'production':
      return `https://api${region}.zamp.ai`;
    case 'staging':
      return `https://api-stg${region}.zamp.ai`;
    case 'development':
      return `https://api-dev${region}.zamp.ai`;
    default:
      return 'http://localhost:8080';
  }
};

export const getUserRegion = () => {
  const userRegion = getFromLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION);

  if (userRegion) {
    return userRegion;
  }

  return '';
};

export let API_DOMAIN = getApiDomain(ENVIRONMENT, getUserRegion());

export const reinitializeApiDomain = () => {
  API_DOMAIN = getApiDomain(ENVIRONMENT, getUserRegion());
};
