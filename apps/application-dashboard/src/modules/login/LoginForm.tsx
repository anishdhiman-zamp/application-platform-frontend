'use client';

import { ChangeEvent, type SubmitEvent, useEffect, useRef, useState } from 'react';
import { BASE_API_URL, getApiDomainAndRegions, reinitializeApiDomain, REQUEST_TYPES } from '@zamp-platform/api';
import { Button, ImageWithFallback } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, removeFromLocalStorage, safeJsonParse } from '@zamp-platform/utils';
import { LOGIN_METHODS, LOGIN_PROVIDERS } from 'constants/auth.constants';
import { MoveLeft } from 'lucide-react';
import {
  ACTIVE_VIEW,
  LOADING_ACTION,
  LOGIN_FORM_MESSAGES,
  LOGIN_GROUPS,
  VALID_SESSION_DETECTED_ERROR_MSG,
} from 'modules/login/login.constants';
import { actionUrlWithOrigin, flowHasCodeNodes, flowHasPasswordNodes } from 'modules/login/login.utils';
import LoginFooter from 'modules/login/LoginFooter';
import { OtpVerification } from 'modules/login/OtpVerification';
import { FlowNode, LoginFlow } from 'types/api/auth.types';
import { getDomainFromEmail, isValidEmail } from 'utils/common';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { AnimatedDitherArrow } from '@/modules/login/AnimatedDitherArrow';
import { LOGIN_ERROR_TEXT } from '@/modules/login/constants';
import { GoogleIcon } from '@/modules/login/GoogleIcon';
import LocaldevEmailPasswordLogin from '@/modules/login/LocaldevEmailPasswordLogin';
import { API_STATUS_CODES } from '@/types/common/statusCodes';
import { MapAny } from '@/types/commonTypes';
import Input from 'components/common/input';

const SSO_LOGO_DISPLAY_MS = 600;

async function createLoginFlow(apiBaseUrl: string, email: string, method?: string): Promise<LoginFlow | null> {
  const apiUrl = `${apiBaseUrl}/${API_ENDPOINTS.AUTH_INITIAL_LOGIN_FLOW_BY_EMAIL_POST}`;
  const response = await fetch(apiUrl, {
    method: REQUEST_TYPES.POST,
    body: JSON.stringify({ email, ...(method && { method }) }),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
  });

  if (response.status !== API_STATUS_CODES.OK) {
    const body = await response.json().catch(() => null);

    throw new Error(body?.error || body?.detail || LOGIN_ERROR_TEXT);
  }

  return response.json();
}

function normalizeFlowActionOrigin(flow: LoginFlow, apiBaseUrl: string): LoginFlow {
  if (!flow?.ui?.action) return flow;

  return {
    ...flow,
    ui: { ...flow.ui, action: actionUrlWithOrigin(flow.ui.action, apiBaseUrl) },
  };
}

export const LoginForm = () => {
  const logoPromiseRef = useRef<Promise<void> | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState('');
  const [logoLoaded, setLogoLoaded] = useState<boolean>(false);
  const [providerLogo, setProviderLogo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [otpFlow, setOtpFlow] = useState<LoginFlow | null>(null);
  const [passwordFlow, setPasswordFlow] = useState<LoginFlow | null>(null);
  const [methodPickerFlow, setMethodPickerFlow] = useState<LoginFlow | null>(null);
  const [loadingAction, setLoadingAction] = useState<LOADING_ACTION>(LOADING_ACTION.IDLE);
  const isLoading = loadingAction !== LOADING_ACTION.IDLE;

  // ── Helpers ─────────────────────────────────────────────────────

  const preloadLogo = (url: string) => {
    setProviderLogo(url);
    setLogoLoaded(false);
    logoPromiseRef.current = new Promise<void>((resolve) => {
      const img = new window.Image();

      img.src = url;
      img.onload = () => {
        setLogoLoaded(true);
        setLoadingAction(LOADING_ACTION.SSO);
        resolve();
      };
      img.onerror = () => {
        setLoadingAction(LOADING_ACTION.SSO);
        resolve();
      };
    });
  };

  const resetLoadingState = () => setLoadingAction(LOADING_ACTION.IDLE);

  const handleRedirect = async (respJson: MapAny, provider: LOGIN_PROVIDERS, emailHint?: string) => {
    try {
      const redirectUrl = respJson.redirect_browser_to;
      const urlObj = new URL(redirectUrl);

      if (emailHint) {
        urlObj.searchParams.set('login_hint', emailHint);
        if (provider === LOGIN_PROVIDERS.GOOGLE) {
          urlObj.searchParams.set('hd', getDomainFromEmail(emailHint));
        }
      }
      if (logoPromiseRef.current) {
        await logoPromiseRef.current;
        await new Promise((r) => setTimeout(r, SSO_LOGO_DISPLAY_MS));
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

  const initiateOidcLogin = async (url: string, method: string, providerId: LOGIN_PROVIDERS, emailHint?: string) => {
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
        handleRedirect(respJson, providerId, emailHint);
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
      const hasCode = flowHasCodeNodes(flow);
      const hasPassword = flowHasPasswordNodes(flow);

      if (hasCode && hasPassword) {
        setMethodPickerFlow(flow);
        resetLoadingState();
      } else if (hasCode) {
        setOtpFlow(normalizeFlowActionOrigin(flow, apiBaseUrl));
        resetLoadingState();
      } else if (nodes.length === 1 && nodes[0]?.group === LOGIN_GROUPS.OIDC) {
        const logoUrl = nodes[0].attributes.logo_url ?? '';

        if (logoUrl) preloadLogo(logoUrl);
        await initiateOidcLogin(flow.ui.action, flow.ui.method, nodes[0].attributes.value as LOGIN_PROVIDERS, email);
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

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setError(null);
    setLoadingAction(LOADING_ACTION.EMAIL);

    if (!isValidEmail(email)) {
      setError(LOGIN_FORM_MESSAGES.INVALID_EMAIL);
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
    setLoadingAction(LOADING_ACTION.GOOGLE);
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

      const oidcNode = (flow.ui?.nodes ?? []).find(
        (n: FlowNode) => n.group === LOGIN_GROUPS.OIDC && n.attributes.value === LOGIN_PROVIDERS.GOOGLE,
      );

      if (oidcNode) {
        await initiateOidcLogin(flow.ui.action, flow.ui.method, oidcNode.attributes.value as LOGIN_PROVIDERS, '');
      } else {
        setError(LOGIN_FORM_MESSAGES.GOOGLE_UNAVAILABLE);
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
        const normalized = normalizeFlowActionOrigin(flow, apiBaseUrl);

        setOtpFlow(normalized);

        return normalized;
      }

      return null;
    } catch {
      return null;
    }
  };

  // ── Method Picker Helpers ───────────────────────────────────────

  const initiateOtpFromPicker = async () => {
    setLoadingAction(LOADING_ACTION.EMAIL);
    try {
      const apiBaseUrl = await resolveApiBaseUrl();
      const flow = await createLoginFlow(apiBaseUrl, email, LOGIN_METHODS.CODE);

      if (flow && flowHasCodeNodes(flow)) {
        setOtpFlow(normalizeFlowActionOrigin(flow, apiBaseUrl));
        setMethodPickerFlow(null);
      } else {
        setError(LOGIN_FORM_MESSAGES.SEND_CODE_FAILED);
      }
    } catch {
      setError(LOGIN_FORM_MESSAGES.SEND_CODE_FAILED);
    } finally {
      resetLoadingState();
    }
  };

  const getSubmitButtonContent = () => {
    if (loadingAction === LOADING_ACTION.SSO && providerLogo && logoLoaded) {
      return (
        <span className='flex items-center gap-2 whitespace-nowrap'>
          Signing in with
          <ImageWithFallback src={providerLogo} alt='provider' className='h-5 max-w-10 object-contain' />
        </span>
      );
    }

    const labelMap: Partial<Record<LOADING_ACTION, string>> = {
      [LOADING_ACTION.SSO]: 'Signing in...',
      [LOADING_ACTION.EMAIL]: 'Continuing...',
    };

    return labelMap[loadingAction] ?? 'Continue';
  };

  // ── View Routing ────────────────────────────────────────────────

  const activeView: ACTIVE_VIEW = otpFlow
    ? ACTIVE_VIEW.OTP
    : passwordFlow
      ? ACTIVE_VIEW.PASSWORD
      : methodPickerFlow
        ? ACTIVE_VIEW.METHOD_PICKER
        : ACTIVE_VIEW.EMAIL_ENTRY;

  useEffect(() => {
    const lastLoginInfoFromLocalStorage = getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGIN_INFO);

    if (lastLoginInfoFromLocalStorage) {
      const lastLoginInfo = safeJsonParse<{ email: string }>(lastLoginInfoFromLocalStorage);

      if (lastLoginInfo?.email) {
        setEmail(lastLoginInfo.email);

        return;
      }
    }

    const lastLoggedInOidcEmail = getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL);

    if (lastLoggedInOidcEmail) setEmail(lastLoggedInOidcEmail);
  }, []);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoadingAction(LOADING_ACTION.IDLE);
    };

    window.addEventListener('pageshow', onPageShow);

    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    const el = emailInputRef.current;

    if (!el) return;

    const handlePaste = () => {
      requestAnimationFrame(() => {
        setEmail(el.value);
        setError(null);
        setProviderLogo('');
        setLogoLoaded(false);
      });
    };

    el.addEventListener('paste', handlePaste);

    return () => el.removeEventListener('paste', handlePaste);
  }, [activeView]);

  switch (activeView) {
    case ACTIVE_VIEW.OTP:
      return (
        <OtpVerification
          email={email}
          flow={otpFlow!}
          onEditEmail={handleEditEmail}
          onFlowExpired={handleFlowExpired}
        />
      );

    case ACTIVE_VIEW.PASSWORD:
      return (
        <LocaldevEmailPasswordLogin
          loginFlow={passwordFlow!}
          setLoginFlow={setPasswordFlow}
          onBack={() => {
            setMethodPickerFlow(passwordFlow);
            setPasswordFlow(null);
            setError(null);
          }}
        />
      );

    case ACTIVE_VIEW.METHOD_PICKER: {
      const btnBase =
        'h-auto w-full overflow-hidden rounded-2xl border px-5 py-3.5 text-sm font-medium transition-all duration-250 cursor-pointer active:scale-[1]';

      return (
        <div>
          <p className='text-GRAY_1000 mb-1 text-sm'>
            Signing in as <span className='font-medium'>{email}</span>
          </p>
          <p className='text-GRAY_700 f-13-400 mb-6'>Choose how you want to sign in</p>
          {error && <p className='text-RED_600 mb-4 text-xs'>{error}</p>}
          <div className='flex flex-col gap-3'>
            <Button
              type='button'
              disabled={isLoading}
              className={cn(
                btnBase,
                'bg-GRAY_1000 hover:bg-GRAY_950 active:bg-GRAY_1000 border-black/10 text-white disabled:opacity-60',
              )}
              onClick={() => initiateOtpFromPicker()}
            >
              {loadingAction === LOADING_ACTION.EMAIL ? 'Sending code...' : 'Sign in with OTP'}
            </Button>
            <Button
              type='button'
              className={cn(btnBase, 'bg-GRAY_100 text-GRAY_1000 hover:bg-GRAY_200 active:bg-GRAY_100 border-black/12')}
              onClick={() => {
                setPasswordFlow(methodPickerFlow);
                setMethodPickerFlow(null);
              }}
            >
              Sign in with Password
            </Button>
          </div>
          <Button
            type='button'
            variant='ghost'
            className='text-GRAY_700 hover:text-GRAY_900 f-13-400 mt-4 flex h-auto items-center gap-1.5 bg-transparent transition-colors hover:bg-transparent'
            onClick={() => {
              setMethodPickerFlow(null);
              setError(null);
            }}
          >
            <MoveLeft className='h-4 w-4' />
            Use a different email
          </Button>
        </div>
      );
    }

    case ACTIVE_VIEW.EMAIL_ENTRY: {
      const isSubmitDisabled = !email.trim() || isLoading;

      return (
        <div>
          <Button
            type='button'
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className='btn-login bg-GRAY_100 text-GRAY_1000 hover:bg-GRAY_200 active:bg-GRAY_100 disabled:bg-GRAY_100 f-14-500 relative flex h-auto w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-black/12 px-5 py-3.5 transition-all duration-250 active:scale-[1] disabled:cursor-not-allowed disabled:opacity-60'
          >
            <GoogleIcon className='relative z-1 h-4 w-4 shrink-0' />
            <span className='relative z-1'>
              {loadingAction === LOADING_ACTION.GOOGLE ? 'Connecting...' : 'Continue with Google'}
            </span>
          </Button>

          <div className='my-6 flex items-center gap-4'>
            <div className='h-px flex-1 bg-black/8' />
            <span className='text-GRAY_700 text-xs font-medium tracking-wide uppercase'>or</span>
            <div className='h-px flex-1 bg-black/8' />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit}>
            <div className='mb-5'>
              <Input
                label='Email'
                labelOverrideClassName='mb-2 block f-13-500 text-GRAY_900'
                id='login-email'
                placeholder='Enter your work email'
                name='email'
                type='email'
                value={email}
                autoFocus
                inputRef={emailInputRef}
                onChange={handleEmailChange}
                disabled={isLoading}
                noBorders
                customPaddingClassName='px-3.5 py-3'
                inputClassName={cn(
                  'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-GRAY_1000 transition-all duration-250 outline-none placeholder:text-GRAY_500',
                  error
                    ? 'border-RED_600 shadow-[0_0_0_3px_rgba(220,38,38,0.08)] focus:border-RED_600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]'
                    : 'border-black/10 focus:border-black/25 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]',
                )}
                focusClassNames=''
                inputRoundedClassName=''
              />
              {error && <p className='text-RED_600 mt-1.5 text-xs'>{error}</p>}
            </div>

            <Button
              type='submit'
              data-testid='login-button'
              disabled={isSubmitDisabled}
              className={cn(
                'group btn-login relative mt-1 flex h-auto w-full items-center justify-center overflow-visible rounded-2xl border px-5 py-3.5 text-sm font-medium transition-all duration-250',
                !isSubmitDisabled
                  ? 'bg-GRAY_1000 hover:bg-GRAY_950 active:bg-GRAY_1000 cursor-pointer border-black/10 text-white active:scale-[0.98]'
                  : 'bg-GRAY_500 text-GRAY_700 disabled:bg-GRAY_500 disabled:text-GRAY_700 cursor-not-allowed border-black/3',
              )}
            >
              <span className='relative z-1'>
                {getSubmitButtonContent()}
                <span className='absolute top-1/2 left-full z-1 ml-2 inline-flex h-4 w-4 -translate-y-1/2 overflow-hidden'>
                  <AnimatedDitherArrow disabled={isSubmitDisabled} />
                </span>
              </span>
            </Button>
          </form>

          <LoginFooter />
        </div>
      );
    }
  }
};
