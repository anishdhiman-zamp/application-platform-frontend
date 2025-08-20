import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';

import { DEV_API_URL, ENVIRONMENT, MULTI_REGION_ENABLED, REGION_LIST, REGIONS_MAP } from './constants';

export const getApiDomainAndRegions = async (email = '') => {
  const region = getCurrentRegion();
  const allRegions = JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.ALL_REGIONS) || '[]');

  if (ENVIRONMENT === 'production' && MULTI_REGION_ENABLED && allRegions.length === 0) {
    const allRegions = await Promise.allSettled(
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

    const successfulRegions = allRegions
      .filter(
        (result): result is PromiseFulfilledResult<{ region: string; status: number }> =>
          result.status === 'fulfilled' && result.value.status === 200,
      )
      .map((result) => result.value.region);

    const defaultRegion = !!successfulRegions.length ? successfulRegions[0] : REGIONS_MAP.us.suffix;
    setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, defaultRegion ?? REGIONS_MAP.us.suffix);
    setToLocalStorage(LOCAL_STORAGE_KEYS.ALL_REGIONS, JSON.stringify(successfulRegions));
    reinitializeApiDomain();

    return { domain: getApiDomain(ENVIRONMENT, defaultRegion ?? REGIONS_MAP.us.suffix), regions: successfulRegions };
  }

  return { domain: getApiDomain(ENVIRONMENT, region), regions: allRegions };
};

const getApiDomain = (environment = '', region = '') => {
  console.log('environment test>>>', environment);
  switch (environment) {
    case 'production':
      return `https://api${region}.zamp.ai`;
    case 'staging':
      return `https://api-stg-aws-us.zamp.ai`;
    case 'development': {
      return DEV_API_URL;
    }
    default:
      return 'http://localhost:8080';
  }
};

export const getCurrentRegion = () => {
  const userRegion = getFromLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION);

  if (userRegion) {
    return userRegion;
  }

  return '';
};

export let API_DOMAIN = getApiDomain(ENVIRONMENT, getCurrentRegion());

export const reinitializeApiDomain = () => {
  API_DOMAIN = getApiDomain(ENVIRONMENT, getCurrentRegion());
};
