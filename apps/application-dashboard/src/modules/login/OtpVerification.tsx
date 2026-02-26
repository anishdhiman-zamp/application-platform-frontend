'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';
import { Pencil } from 'lucide-react';
import { OTP_MESSAGES, OTP_STATUS } from 'modules/login/login.constants';
import {
  buildOtpSubmitBody,
  buildResendBody,
  determineExpiryType,
  isInvalidCodeResponse,
  isResendSuccessResponse,
} from 'modules/login/otp.utils';
import { OtpInput, OtpInputHandle } from 'modules/login/OtpInput';
import { FlowExpiredResponse, FlowUiMessage, LoginFlow } from 'types/api/auth.types';
import { API_STATUS_CODES } from '@/types/common/statusCodes';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type OtpMessage = { type: 'error' | 'info'; text: string } | null;

type Props = {
  email: string;
  flow: LoginFlow;
  onEditEmail: () => void;
  onFlowExpired: () => Promise<LoginFlow | null>;
};

export const OtpVerification: FC<Props> = ({ email, flow, onEditEmail, onFlowExpired }) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [message, setMessage] = useState<OtpMessage>(null);
  const [status, setStatus] = useState<OTP_STATUS>(OTP_STATUS.IDLE);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef<OtpInputHandle>(null);
  const flowRef = useRef(flow);
  const abortRef = useRef<AbortController | null>(null);

  const isBusy = status !== OTP_STATUS.IDLE;
  const allFilled = digits.every((d) => d.length === 1);

  const clearDigitsAndFocus = useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(''));
    requestAnimationFrame(() => otpInputRef.current?.focusFirst());
  }, []);

  const setDigitAt = useCallback((index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];

      next[index] = value;

      return next;
    });
  }, []);

  // ── Network Helpers ─────────────────────────────────────────────

  function makeAbortController(): AbortController {
    abortRef.current?.abort();
    const controller = new AbortController();

    abortRef.current = controller;

    return controller;
  }

  function updateFlowUi(responseData: { ui?: LoginFlow['ui'] }): void {
    if (responseData.ui?.nodes) {
      flowRef.current = { ...flowRef.current, ui: responseData.ui };
    }
  }

  async function resendOnCurrentFlow(signal: AbortSignal): Promise<'sent' | 'flow_expired' | 'failed'> {
    try {
      const currentFlow = flowRef.current;
      const resp = await fetch(currentFlow.ui.action, {
        method: 'POST',
        credentials: 'include',
        signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildResendBody(currentFlow.ui.nodes)),
      });

      if (resp.status === API_STATUS_CODES.GONE) return 'flow_expired';
      if (resp.status >= 500) return 'failed';

      const data = await resp.json();

      if (isResendSuccessResponse(data)) updateFlowUi(data);

      return isResendSuccessResponse(data) ? 'sent' : 'failed';
    } catch {
      return 'failed';
    }
  }

  // ── Response Handlers (for submitCode) ──────────────────────────

  function handleSubmitSuccess(data: { continue_with?: { redirect_browser_to?: string }[] }): void {
    setStatus(OTP_STATUS.SUCCESS);
    setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGIN_INFO, JSON.stringify({ email, method: 'code' }));
    const redirectUrl = data.continue_with?.[0]?.redirect_browser_to;

    window.location.href = redirectUrl || window.location.href;
  }

  function handleLocationChange(data: { redirect_browser_to?: string }): void {
    if (data.redirect_browser_to) {
      window.location.href = data.redirect_browser_to;
    } else {
      setMessage({ type: 'error', text: OTP_MESSAGES.GENERIC_ERROR });
    }
  }

  async function handleExpired(data: FlowExpiredResponse, signal: AbortSignal): Promise<void> {
    clearDigitsAndFocus();

    const expiryType = determineExpiryType(data.expired_at, flowRef.current.expires_at);

    switch (expiryType) {
      case 'code_expired': {
        const result = await resendOnCurrentFlow(signal);

        setMessage({
          type: result === 'sent' ? 'info' : 'error',
          text: result === 'sent' ? OTP_MESSAGES.CODE_EXPIRED_RESENT : OTP_MESSAGES.CODE_EXPIRED_RESEND_PROMPT,
        });
        break;
      }
      case 'flow_expired': {
        const newFlow = await onFlowExpired();

        setMessage({
          type: newFlow ? 'info' : 'error',
          text: newFlow ? OTP_MESSAGES.SESSION_EXPIRED_RESENT : OTP_MESSAGES.SESSION_EXPIRED_RETRY,
        });
        break;
      }
      default: {
        const result = await resendOnCurrentFlow(signal);

        if (result === 'sent') {
          setMessage({ type: 'info', text: OTP_MESSAGES.CODE_EXPIRED_RESENT });
        } else if (result === 'flow_expired') {
          const newFlow = await onFlowExpired();

          setMessage({
            type: newFlow ? 'info' : 'error',
            text: newFlow ? OTP_MESSAGES.SESSION_EXPIRED_RESENT : OTP_MESSAGES.SESSION_EXPIRED_RETRY,
          });
        } else {
          setMessage({ type: 'error', text: OTP_MESSAGES.GENERIC_ERROR });
        }
        break;
      }
    }

    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }

  function handleSubmitBadRequest(data: { error?: { id: string }; ui?: LoginFlow['ui'] }): void {
    if (data.error?.id === 'session_already_available') {
      window.location.reload();

      return;
    }

    updateFlowUi(data);
    clearDigitsAndFocus();

    setMessage({
      type: 'error',
      text: isInvalidCodeResponse(data.ui?.messages as FlowUiMessage[])
        ? OTP_MESSAGES.INCORRECT_CODE
        : OTP_MESSAGES.GENERIC_ERROR,
    });
  }

  // ── Core Actions ────────────────────────────────────────────────

  const submitCode = async () => {
    if (isBusy) return;
    const code = digits.join('');

    if (code.length !== OTP_LENGTH) return;

    setStatus(OTP_STATUS.SUBMITTING);
    setMessage(null);

    try {
      const currentFlow = flowRef.current;
      const controller = makeAbortController();

      const resp = await fetch(currentFlow.ui.action, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildOtpSubmitBody(code, currentFlow.ui.nodes)),
      });

      switch (resp.status) {
        case API_STATUS_CODES.OK:
          handleSubmitSuccess(await resp.json());

          return;
        case API_STATUS_CODES.UNPROCESSABLE_ENTITY:
          handleLocationChange(await resp.json());

          return;
        case API_STATUS_CODES.GONE:
          await handleExpired(await resp.json(), controller.signal);

          return;
        case API_STATUS_CODES.BAD_REQUEST:
          handleSubmitBadRequest(await resp.json());

          return;
        default:
          setMessage({ type: 'error', text: OTP_MESSAGES.GENERIC_ERROR });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setMessage({ type: 'error', text: OTP_MESSAGES.NETWORK_ERROR });
    } finally {
      setStatus((prev) => (prev === OTP_STATUS.SUCCESS ? prev : OTP_STATUS.IDLE));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isBusy) return;

    setStatus(OTP_STATUS.RESENDING);
    setMessage(null);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    try {
      const controller = makeAbortController();
      const result = await resendOnCurrentFlow(controller.signal);

      switch (result) {
        case 'sent':
          setMessage({ type: 'info', text: OTP_MESSAGES.NEW_CODE_SENT });
          break;
        case 'flow_expired': {
          const newFlow = await onFlowExpired();

          if (newFlow) {
            setMessage({ type: 'info', text: OTP_MESSAGES.SESSION_EXPIRED_RESENT });
          } else {
            setMessage({ type: 'error', text: OTP_MESSAGES.SESSION_EXPIRED_RETRY });
            setResendCooldown(0);
          }
          break;
        }
        case 'failed':
          setMessage({ type: 'error', text: OTP_MESSAGES.RESEND_FAILED });
          setResendCooldown(0);
          break;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setMessage({ type: 'error', text: OTP_MESSAGES.RESEND_FAILED });
      setResendCooldown(0);
    } finally {
      setStatus(OTP_STATUS.IDLE);
    }
  };

  // ── Effects ────────────────────────────────────────────────────

  useEffect(() => {
    flowRef.current = flow;
  }, [flow]);

  useEffect(() => {
    otpInputRef.current?.focusFirst();

    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Render ──────────────────────────────────────────────────────

  const isError = message?.type === 'error';

  return (
    <div>
      <div className='mb-8 text-center'>
        <h2 className='text-GRAY_1000 mb-2.5 text-xl font-semibold'>Confirm your email</h2>
        <p className='text-GRAY_700 text-[13px] leading-relaxed'>
          <span className='mb-2 block'>Enter the code we sent to</span>
          <span className='inline-flex items-center gap-1.5'>
            <span className='text-GRAY_950 font-medium'>{email}</span>
            <button
              type='button'
              onClick={onEditEmail}
              disabled={isBusy}
              className={cn(
                'inline-flex items-center border-none bg-transparent p-0.5 transition-colors duration-200',
                isBusy ? 'text-GRAY_500 cursor-not-allowed' : 'text-GRAY_700 hover:text-GRAY_1000 cursor-pointer',
              )}
              title='Edit email'
            >
              <Pencil size={14} />
            </button>
          </span>
        </p>
      </div>

      <OtpInput
        ref={otpInputRef}
        digits={digits}
        isError={!!isError}
        isBusy={isBusy}
        allFilled={allFilled}
        onDigitChange={setDigitAt}
        onDigitsReplace={setDigits}
        onClearMessage={() => setMessage(null)}
        onSubmit={submitCode}
      />

      {message && (
        <p className={cn('-mt-4 mb-4 text-center text-xs', isError ? 'text-red-600' : 'text-GRAY_900')}>
          {message.text}
        </p>
      )}

      <Button
        type='button'
        onClick={submitCode}
        disabled={!allFilled || isBusy}
        className={cn(
          'relative h-auto w-full overflow-hidden rounded-2xl px-5 py-3.5 text-sm font-medium transition-all duration-250',
          allFilled && !isBusy
            ? 'bg-GRAY_1000 hover:bg-GRAY_950 active:bg-GRAY_1000 cursor-pointer text-white active:scale-[0.98]'
            : 'bg-GRAY_500 text-GRAY_700 disabled:bg-GRAY_500 disabled:text-GRAY_700 cursor-not-allowed',
        )}
      >
        {status === OTP_STATUS.SUBMITTING || status === OTP_STATUS.SUCCESS ? 'Verifying...' : 'Verify'}
      </Button>

      <p className='text-GRAY_700 mt-6 text-center text-[13px]'>
        Didn&apos;t receive a code?{' '}
        <button
          type='button'
          onClick={handleResend}
          disabled={resendCooldown > 0 || isBusy}
          className={cn(
            'border-none bg-transparent font-medium transition-colors duration-150',
            resendCooldown > 0 || isBusy
              ? 'text-GRAY_500 cursor-not-allowed no-underline'
              : 'text-GRAY_950 hover:text-GRAY_1000 cursor-pointer underline underline-offset-2',
          )}
          style={{ fontFamily: 'inherit', fontSize: '13px' }}
        >
          {status === OTP_STATUS.RESENDING
            ? 'Sending...'
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend code'}
        </button>
      </p>
    </div>
  );
};
