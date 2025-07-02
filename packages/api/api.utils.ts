import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';

import { ENVIRONMENT, MULTI_REGION_ENABLED, REGION_LIST } from './constants';

export const getApiDomainByRegion = async (email = '', changeSession = true) => {
  const userRegion = getUserRegion();

  if ((ENVIRONMENT === 'production' && !userRegion && MULTI_REGION_ENABLED) || true) {
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

    const successfulRegion = apiDomains.filter(
      (result): result is PromiseFulfilledResult<{ region: string; status: number }> => result.status === 'fulfilled',
    );

    // Reorder successfulRegion if userRegion exists
    if (userRegion) {
      const idx = successfulRegion.findIndex((result) => result.value.region === userRegion);
      if (idx > 0 && changeSession) {
        const [matched] = successfulRegion.splice(idx, 1);
        successfulRegion.unshift(matched);
      }
    }

    // const region = successfulRegion.find((result) => result.value.status === 200)?.value.region;
    // setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, region ?? '');
    const allDomains = successfulRegion.map((result) => ({
      domain: getApiDomain(ENVIRONMENT, result.value.region ?? ''),
      region: result.value.region,
    }));

    reinitializeApiDomain();

    return allDomains;
  }
};

const getApiDomain = (environment = '', region = '') => {
  switch (environment) {
    case 'production':
      return `https://api${region}.zamp.ai`;
    case 'staging':
      return `https://api-stg${region}.zamp.ai`;
    case 'development': {
      const reg = region.length ? region : '-dev';

      return `https://api${reg}.zamp.ai`;
    }
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
