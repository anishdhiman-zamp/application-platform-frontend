import { captureException } from '@sentry/browser';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';

import { DEV_API_URL, ENVIRONMENT, MULTI_REGION_ENABLED, REGION_LIST, REGIONS_MAP, STATUS_CODE } from './constants';

const checkAllRegionsFetched = (allRegions: PromiseSettledResult<{ region: string; status: number }>[]) => {
  const allRegionsFetched = allRegions.every((result) => {
    if (
      result.status === 'fulfilled' &&
      [STATUS_CODE.NOT_FOUND as number, STATUS_CODE.BAD_REQUEST as number, STATUS_CODE.OK as number].includes(
        result.value.status,
      )
    )
      return true;

    captureException(new Error(JSON.stringify(result)));
    return false;
  });

  return allRegionsFetched;
};

export const getApiDomainAndRegions = async (email = '') => {
  const region = getCurrentRegion();
  let allRegions = [];
  try {
    allRegions = JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.ALL_REGIONS) || '[]');
  } catch {
    allRegions = [];
  }

  if (ENVIRONMENT === 'production' && MULTI_REGION_ENABLED && allRegions.length === 0) {
    let defaultRegion = region ?? REGIONS_MAP.us.suffix;
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

    const allRegionsFetched = checkAllRegionsFetched(allRegions);

    const successfulRegions = allRegions
      .filter(
        (result): result is PromiseFulfilledResult<{ region: string; status: number }> =>
          result.status === 'fulfilled' && result.value.status === STATUS_CODE.OK,
      )
      .map((result) => result.value.region);

    if (successfulRegions.length > 0) {
      defaultRegion = successfulRegions[0];
    }

    setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, defaultRegion);

    if (allRegionsFetched) setToLocalStorage(LOCAL_STORAGE_KEYS.ALL_REGIONS, JSON.stringify(successfulRegions));

    reinitializeApiDomain();

    return { domain: getApiDomain(ENVIRONMENT, defaultRegion), regions: successfulRegions };
  }

  return { domain: getApiDomain(ENVIRONMENT, region), regions: allRegions };
};

export const getApiDomain = (environment = '', region = '') => {
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
