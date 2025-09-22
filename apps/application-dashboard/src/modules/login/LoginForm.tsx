import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { getApiDomainAndRegions, REGIONS_MAP, REQUEST_TYPES } from '@zamp-platform/api';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@zamp-platform/utils';
import { LOGIN_PROVIDERS } from 'constants/auth.constants';
import { ZAMP_FULL_LOGO, ZAMP_LOGIN_BG } from 'constants/icons';
import { LOGIN_ERROR_TEXT } from 'modules/login/constants';
import LocaldevEmailPasswordLogin from 'modules/login/LocaldevEmailPasswordLogin';
import { LOGIN_GROUPS, VALID_SESSION_DETECTED_ERROR_MSG } from 'modules/login/login.constants';
import LoginButton from 'modules/login/LoginButton';
import RegionsSelectDropdown from 'modules/login/RegionsSelectDropdown';
import Image from 'next/image';
import { LoginFlow } from 'types/api/auth.types';
import { SIZE_TYPES } from 'types/common/components';
import { getDomainFromEmail, isValidEmail } from 'utils/common';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { API_STATUS_CODES } from '@/types/common/statusCodes';
import { MapAny } from '@/types/commonTypes';
import Input from 'components/common/input';

export const LoginForm = () => {
  const [email, setEmail] = useState(getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL) ?? '');
  const [loginFlow, setLoginFlow] = useState<LoginFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [providerLogo, setProviderLogo] = useState<string>('');
  const [allRegions, setAllRegions] = useState<{ region: string; url: string }[]>([]);
  const [defaultRegion, setDefaultRegion] = useState<string>('');

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.value !== undefined) {
      setEmail(e.target.value);
    }
  };

  const handleRedirect = (respJson: MapAny) => {
    setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL, email);

    try {
      const redirectUrl = respJson.redirect_browser_to;

      const emailDomain = getDomainFromEmail(email);

      const urlObj = new URL(redirectUrl);

      urlObj.searchParams.set('hd', emailDomain);

      setHasError(false);
      window.location.href = urlObj.toString();
    } catch (error) {
      console.error(error);
      setLoading(false);
      setHasError(true);
    }
  };

  const initiateOidcLogin = async (url: string, method: string, providerId: LOGIN_PROVIDERS) => {
    setLoading(true);
    try {
      const resp = await fetch(url, {
        method: method,
        body: JSON.stringify({
          provider: providerId,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      const respJson = await resp.json();

      const validSessionMsg =
        resp.status === API_STATUS_CODES.BAD_REQUEST &&
        respJson?.ui?.messages?.[0]?.text?.includes(VALID_SESSION_DETECTED_ERROR_MSG);

      const shouldRedirect =
        resp.status === API_STATUS_CODES.OK || resp.status === API_STATUS_CODES.UNPROCESSABLE_ENTITY || validSessionMsg;

      if (shouldRedirect) {
        handleRedirect(respJson);
      } else {
        switch (resp.status) {
          case API_STATUS_CODES.BAD_REQUEST: {
            setError(respJson?.ui?.messages?.[0]?.text ?? LOGIN_ERROR_TEXT);
            setHasError(true);
            setLoading(false);
            break;
          }

          default: {
            setError(respJson?.error?.message ?? LOGIN_ERROR_TEXT);
            setHasError(true);
            setLoading(false);
            setLoginFlow(respJson);
            break;
          }
        }
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      setHasError(true);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);

      return;
    }
    const allRegionsResponse = await getApiDomainAndRegions(email);

    if (allRegionsResponse.length > 1 && allRegions.length === 0) {
      setAllRegions(allRegionsResponse);

      setLoading(false);

      return;
    }

    try {
      const apiUrl = `${allRegionsResponse[0].url}/${API_ENDPOINTS.AUTH_INITIAL_LOGIN_FLOW_BY_EMAIL_POST}`;

      const response = await fetch(apiUrl, {
        method: REQUEST_TYPES.POST,
        body: JSON.stringify({
          email,
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      const respJson = await response.json();

      setHasError(false);

      if (response.status !== API_STATUS_CODES.OK) {
        setError(respJson.error);
        removeFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL);
        setHasError(true);
        setLoading(false);

        return;
      }

      setLoginFlow(respJson);
      setProviderLogo(respJson?.ui?.nodes?.[0]?.attributes?.logo_url);

      // if the number of login methods is 1 and it is OIDC, we can directly login
      if (respJson?.ui?.nodes?.length == 1) {
        const loginNode = respJson.ui.nodes[0];

        if (loginNode?.group === LOGIN_GROUPS.OIDC) {
          await initiateOidcLogin(
            respJson.ui.action,
            respJson.ui.method,
            loginNode.attributes.value as LOGIN_PROVIDERS,
          );
        }
      } else {
        setLoading(false);
      }
    } catch {
      setHasError(true);
      setLoading(false);
    }
  };

  const setRegionFromUrlParams = (region: string) => {
    setDefaultRegion(region);
    setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, region);
  };

  useEffect(() => {
    try {
      const regions = JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.ALL_REGIONS) ?? '[]');
      const urlParams = new URLSearchParams(window.location.search);
      const region = urlParams.get('region');

      if (region) {
        const regionValue = REGIONS_MAP[region as keyof typeof REGIONS_MAP].suffix || REGIONS_MAP.us.suffix;

        setRegionFromUrlParams(regionValue);
      }

      setAllRegions(regions);
    } catch (error) {
      captureException(error);
      setAllRegions([]);
    }
  }, []);

  const inputDisabled = loading;

  if (!hasError && loginFlow && loginFlow?.ui?.nodes?.length > 1) {
    return <LocaldevEmailPasswordLogin loginFlow={loginFlow} setLoginFlow={setLoginFlow} />;
  }

  return (
    <div className='bg-BG_GRAY_5 relative flex h-screen w-screen items-center justify-center'>
      <video autoPlay muted loop className='absolute z-0 h-full w-full object-cover'>
        <source src={ZAMP_LOGIN_BG} type='video/mp4' />
        <span className='f-14-400 text-GRAY_1000'>Your browser does not support the video tag.</span>
      </video>
      <div className='rounded-4.5 shadow-table-filter-menu border-GRAY_100 z-50 w-[580px] border bg-white px-16 py-[82px]'>
        <Image src={ZAMP_FULL_LOGO} priority alt='ZAMP' width={98} height={24} />
        <form onSubmit={handleSubmit}>
          <div className='mt-10 flex gap-2'>
            <Input
              id='login-email'
              placeholder='Enter your email address'
              className='flex-1'
              name='email'
              type='email'
              value={email}
              error={error ? error : ''}
              autoFocus
              onChange={handleEmailChange}
              disabled={inputDisabled}
              size={SIZE_TYPES.LARGE}
            />
            <RegionsSelectDropdown defaultRegion={defaultRegion} regions={allRegions} />
          </div>
          <LoginButton loading={loading} onClick={() => handleSubmit} providerLogo={providerLogo} />
        </form>
      </div>
    </div>
  );
};
