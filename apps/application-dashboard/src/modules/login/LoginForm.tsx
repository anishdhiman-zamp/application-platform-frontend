'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { BASE_API_URL, getApiDomainAndRegions, reinitializeApiDomain, REQUEST_TYPES } from '@zamp-platform/api';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@zamp-platform/utils';
import { LOGIN_PROVIDERS } from 'constants/auth.constants';
import { LOGIN_ERROR_TEXT } from 'modules/login/constants';
import LocaldevEmailPasswordLogin from 'modules/login/LocaldevEmailPasswordLogin';
import { LOGIN_GROUPS, VALID_SESSION_DETECTED_ERROR_MSG } from 'modules/login/login.constants';
import { OtpVerification } from 'modules/login/OtpVerification';
import { FlowNode, LoginFlow } from 'types/api/auth.types';
import { getDomainFromEmail, isValidEmail } from 'utils/common';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { API_STATUS_CODES } from '@/types/common/statusCodes';
import { MapAny } from '@/types/commonTypes';

type LoadingAction = 'idle' | 'email' | 'google' | 'sso';

async function createLoginFlow(apiBaseUrl: string, email: string): Promise<LoginFlow | null> {
  const apiUrl = `${apiBaseUrl}/${API_ENDPOINTS.AUTH_INITIAL_LOGIN_FLOW_BY_EMAIL_POST}`;
  const response = await fetch(apiUrl, {
    method: REQUEST_TYPES.POST,
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
  });

  if (response.status !== API_STATUS_CODES.OK) {
    const body = await response.json().catch(() => null);

    throw new Error(body?.error || body?.detail || LOGIN_ERROR_TEXT);
  }

  return response.json();
}

function flowHasCodeNodes(flow: LoginFlow): boolean {
  return flow.ui?.nodes?.some((n: FlowNode) => n.group === LOGIN_GROUPS.CODE) ?? false;
}

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [passwordFlow, setPasswordFlow] = useState<LoginFlow | null>(null);
  const [otpFlow, setOtpFlow] = useState<LoginFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>('idle');
  const [providerLogo, setProviderLogo] = useState('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoPromiseRef = useRef<Promise<void> | null>(null);

  const isLoading = loadingAction !== 'idle';

  const preloadLogo = (url: string) => {
    setProviderLogo(url);
    setLogoLoaded(false);
    logoPromiseRef.current = new Promise<void>((resolve) => {
      const img = new window.Image();

      img.src = url;
      img.onload = () => {
        setLogoLoaded(true);
        setLoadingAction('sso');
        resolve();
      };
      img.onerror = () => {
        setLoadingAction('sso');
        resolve();
      };
    });
  };

  useEffect(() => {
    try {
      const raw = getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGIN_INFO);

      if (raw) {
        const info = JSON.parse(raw);

        if (info?.email) setEmail(info.email);

        return;
      }
    } catch {
      // fall through to legacy key
    }
    const legacy = getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL);

    if (legacy) setEmail(legacy);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────

  const resetLoadingState = () => setLoadingAction('idle');

  const handleRedirect = async (respJson: MapAny, provider: LOGIN_PROVIDERS) => {
    if (email) {
      setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGIN_INFO, JSON.stringify({ email, method: 'oidc', provider }));
    }

    try {
      const redirectUrl = respJson.redirect_browser_to;
      const urlObj = new URL(redirectUrl);

      if (email) {
        urlObj.searchParams.set('login_hint', email);
        if (provider === LOGIN_PROVIDERS.GOOGLE) {
          urlObj.searchParams.set('hd', getDomainFromEmail(email));
        }
      }
      if (logoPromiseRef.current) {
        await logoPromiseRef.current;
        await new Promise((r) => setTimeout(r, 1200));
      }
      window.location.href = urlObj.toString();
    } catch {
      resetLoadingState();
      setError(LOGIN_ERROR_TEXT);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.value !== undefined) {
      setEmail(e.target.value);
      setError(null);
      setProviderLogo('');
      setLogoLoaded(false);
    }
  };

  async function resolveApiBaseUrl(): Promise<string> {
    const regions = await getApiDomainAndRegions(email);

    return regions?.length > 0 ? regions[0]?.url : BASE_API_URL;
  }

  // ── OIDC / SSO ─────────────────────────────────────────────────

  const initiateOidcLogin = async (url: string, method: string, providerId: LOGIN_PROVIDERS) => {
    try {
      const resp = await fetch(url, {
        method,
        body: JSON.stringify({ provider: providerId }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      });
      const respJson = await resp.json();

      const validSessionMsg =
        resp.status === API_STATUS_CODES.BAD_REQUEST &&
        respJson?.ui?.messages?.[0]?.text?.includes(VALID_SESSION_DETECTED_ERROR_MSG);

      if (
        resp.status === API_STATUS_CODES.OK ||
        resp.status === API_STATUS_CODES.UNPROCESSABLE_ENTITY ||
        validSessionMsg
      ) {
        handleRedirect(respJson, providerId);
      } else {
        const errorText = respJson?.ui?.messages?.[0]?.text ?? respJson?.error?.message ?? LOGIN_ERROR_TEXT;

        setError(errorText);
        resetLoadingState();
      }
    } catch {
      setError(LOGIN_ERROR_TEXT);
      resetLoadingState();
    }
  };

  // ── Email Login Flow ────────────────────────────────────────────

  const doLogin = async (apiBaseUrl: string) => {
    reinitializeApiDomain(apiBaseUrl);

    try {
      const flow = await createLoginFlow(apiBaseUrl, email);

      if (!flow) {
        setError(LOGIN_ERROR_TEXT);
        resetLoadingState();

        return;
      }

      const nodes = flow.ui?.nodes ?? [];

      if (flowHasCodeNodes(flow)) {
        setOtpFlow(flow);
        resetLoadingState();
      } else if (nodes.length === 1 && nodes[0]?.group === LOGIN_GROUPS.OIDC) {
        const logoUrl = nodes[0].attributes.logo_url ?? '';

        if (logoUrl) preloadLogo(logoUrl);
        await initiateOidcLogin(flow.ui.action, flow.ui.method, nodes[0].attributes.value as LOGIN_PROVIDERS);
      } else {
        setPasswordFlow(flow);
        resetLoadingState();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : LOGIN_ERROR_TEXT);
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGIN_INFO);
      resetLoadingState();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setError(null);
    setLoadingAction('email');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      resetLoadingState();

      return;
    }

    try {
      const apiBaseUrl = await resolveApiBaseUrl();

      await doLogin(apiBaseUrl);
    } catch {
      setError(LOGIN_ERROR_TEXT);
      resetLoadingState();
    }
  };

  // ── Google Login ────────────────────────────────────────────────

  const handleGoogleLogin = async () => {
    setLoadingAction('google');
    setError(null);

    try {
      const flowUrl = `${BASE_API_URL}/${API_ENDPOINTS.AUTH_INITIATE_LOGIN_FLOW_GET}`;
      const resp = await fetch(flowUrl, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const flow = await resp.json();

      if (resp.status !== API_STATUS_CODES.OK) {
        setError(flow?.error?.message ?? LOGIN_ERROR_TEXT);
        resetLoadingState();

        return;
      }

      const oidcNode = (flow.ui?.nodes ?? []).find((n: FlowNode) => n.group === LOGIN_GROUPS.OIDC);

      if (oidcNode) {
        const actionUrlObj = new URL(flow.ui.action);
        const baseUrlObj = new URL(BASE_API_URL);

        actionUrlObj.protocol = baseUrlObj.protocol;
        actionUrlObj.host = baseUrlObj.host;
        await initiateOidcLogin(actionUrlObj.toString(), flow.ui.method, oidcNode.attributes.value as LOGIN_PROVIDERS);
      } else {
        setError('Google login is not available for this configuration');
        resetLoadingState();
      }
    } catch {
      setError(LOGIN_ERROR_TEXT);
      resetLoadingState();
    }
  };

  // ── OTP Callbacks ───────────────────────────────────────────────

  const handleEditEmail = () => {
    setOtpFlow(null);
    setError(null);
  };

  const handleFlowExpired = async (): Promise<LoginFlow | null> => {
    try {
      const apiBaseUrl = await resolveApiBaseUrl();

      reinitializeApiDomain(apiBaseUrl);

      const flow = await createLoginFlow(apiBaseUrl, email);

      if (flow && flowHasCodeNodes(flow)) {
        setOtpFlow(flow);

        return flow;
      }

      return null;
    } catch {
      return null;
    }
  };

  // ── View Routing ────────────────────────────────────────────────

  if (otpFlow) {
    return (
      <OtpVerification email={email} flow={otpFlow} onEditEmail={handleEditEmail} onFlowExpired={handleFlowExpired} />
    );
  }

  if (passwordFlow) {
    return <LocaldevEmailPasswordLogin loginFlow={passwordFlow} setLoginFlow={setPasswordFlow} />;
  }

  // ── Email Entry View ────────────────────────────────────────────

  const isSubmitDisabled = !email.trim() || isLoading;

  return (
    <div>
      {/* Google Sign In */}
      <button
        type='button'
        disabled={isLoading}
        onClick={handleGoogleLogin}
        className='btn-login relative flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-black/12 bg-[#f3f3f3] px-5 py-3.5 text-sm font-medium text-[#1a1a1a] transition-all duration-250 hover:bg-[#ebebeb] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
      >
        <svg
          className='relative z-[1] h-[18px] w-[18px] shrink-0'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'
            fill='#4285F4'
          />
          <path
            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            fill='#34A853'
          />
          <path
            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
            fill='#FBBC05'
          />
          <path
            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            fill='#EA4335'
          />
        </svg>
        <span className='relative z-[1]'>{loadingAction === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      {/* Divider */}
      <div className='my-6 flex items-center gap-4'>
        <div className='h-px flex-1 bg-black/8' />
        <span className='text-xs font-medium tracking-wide text-[#999] uppercase'>or</span>
        <div className='h-px flex-1 bg-black/8' />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit}>
        <div className='mb-5'>
          <label htmlFor='login-email' className='mb-2 block text-[13px] font-medium text-[#666]'>
            Email
          </label>
          <input
            id='login-email'
            data-testid='email-input'
            data-error={error ?? ''}
            placeholder='Enter your work email'
            name='email'
            type='email'
            value={email}
            autoFocus
            onChange={handleEmailChange}
            disabled={isLoading}
            className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1a1a1a] transition-all duration-250 outline-none placeholder:text-[#bbb] ${
              error
                ? 'border-[#e53935] shadow-[0_0_0_3px_rgba(229,57,53,0.08)] focus:border-[#e53935] focus:shadow-[0_0_0_3px_rgba(229,57,53,0.12)]'
                : 'border-black/10 focus:border-black/25 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]'
            }`}
          />
          {error && <p className='mt-1.5 text-xs text-[#e53935]'>{error}</p>}
        </div>

        <button
          type='submit'
          data-testid='login-button'
          disabled={isSubmitDisabled}
          className={`group btn-login relative mt-1 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border px-5 py-3.5 text-sm font-medium transition-all duration-250 ${
            !isSubmitDisabled
              ? 'cursor-pointer border-black/10 bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] active:scale-[0.98]'
              : 'cursor-not-allowed border-black/3 bg-[#d0d0d0] text-[#999]'
          }`}
        >
          <span className='relative z-[1] flex items-center gap-1.5'>
            {loadingAction === 'sso' && providerLogo && logoLoaded ? (
              <>
                Signing in with
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={providerLogo} alt='provider' className='h-5 max-w-[40px] object-contain' />
              </>
            ) : loadingAction === 'sso' ? (
              'Signing in...'
            ) : loadingAction === 'email' ? (
              'Continuing...'
            ) : (
              'Continue'
            )}
          </span>
          <span className='relative z-[1] inline-flex h-[17px] w-[17px] overflow-hidden'>
            <svg
              className={`h-[17px] w-[17px] -translate-x-[40%] translate-y-[40%] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                !isSubmitDisabled
                  ? 'group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100'
                  : 'opacity-30'
              }`}
              viewBox='0 0 17 17'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect
                x='3'
                y='11.9998'
                width='8.48409'
                height='2.12102'
                transform='rotate(-45 3 11.9998)'
                fill='currentColor'
              />
              <rect
                x='9'
                y='5.99979'
                width='2.12102'
                height='2.12102'
                transform='rotate(-45 9 5.99979)'
                fill='currentColor'
              />
              <rect
                x='7.49609'
                y='4.49979'
                width='2.12102'
                height='2.12102'
                transform='rotate(-45 7.49609 4.49979)'
                fill='currentColor'
              />
              <rect
                x='4.49609'
                y='4.5037'
                width='2.12102'
                height='2.12102'
                transform='rotate(-45 4.49609 4.5037)'
                fill='currentColor'
              />
              <rect
                x='10.5'
                y='7.50174'
                width='2.12102'
                height='2.12102'
                transform='rotate(-45 10.5 7.50174)'
                fill='currentColor'
              />
              <rect
                x='10.5'
                y='4.50174'
                width='2.12102'
                height='2.12102'
                transform='rotate(-45 10.5 4.50174)'
                fill='currentColor'
              />
              <rect
                x='10.4961'
                y='10.5037'
                width='2.12102'
                height='2.12102'
                transform='rotate(-45 10.4961 10.5037)'
                fill='currentColor'
              />
            </svg>
          </span>
        </button>
      </form>

      {/* Terms */}
      <p className='mt-6 text-center text-[11.5px] leading-[1.7] text-[#999]'>
        By using Zamp, you are agreeing to our
        <br />
        <a
          href='https://www.zamp.finance/privacy-policy'
          className='border-b border-[#555]/30 text-[#555] transition-colors duration-150 hover:border-[#1a1a1a]/40 hover:text-[#1a1a1a]'
          target='_blank'
          rel='noopener noreferrer'
        >
          Privacy Policy
        </a>{' '}
        and{' '}
        <a
          href='https://www.zamp.finance/terms-of-use'
          className='border-b border-[#555]/30 text-[#555] transition-colors duration-150 hover:border-[#1a1a1a]/40 hover:text-[#1a1a1a]'
          target='_blank'
          rel='noopener noreferrer'
        >
          Terms of Service
        </a>
        .
      </p>
    </div>
  );
};
