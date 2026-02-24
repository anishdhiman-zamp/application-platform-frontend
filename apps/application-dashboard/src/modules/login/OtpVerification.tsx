'use client';

import { ClipboardEvent, FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';
import { LOGIN_METHODS } from 'constants/auth.constants';
import { INVALID_CODE_MESSAGE_IDS, RESEND_SUCCESS_MESSAGE_IDS } from 'modules/login/login.constants';
import { collectHiddenNodeValues, getCsrfToken } from 'modules/login/otp.utils';
import { FlowExpiredResponse, FlowUiMessage, LoginFlow } from 'types/api/auth.types';
import { API_STATUS_CODES } from '@/types/common/statusCodes';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type OtpStatus = 'idle' | 'submitting' | 'resending' | 'success';
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
  const [status, setStatus] = useState<OtpStatus>('idle');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const flowRef = useRef(flow);
  const abortRef = useRef<AbortController | null>(null);

  const isBusy = status !== 'idle';
  const allFilled = digits.every((d) => d.length === 1);

  useEffect(() => {
    flowRef.current = flow;
  }, [flow]);

  useEffect(() => {
    inputRefs.current[0]?.focus();

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

  const clearDigitsAndFocus = useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(''));
    requestAnimationFrame(() => inputRefs.current[0]?.focus());
  }, []);

  const setDigitAt = useCallback((index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];

      next[index] = value;

      return next;
    });
  }, []);

  // ── Input Handlers ──────────────────────────────────────────────

  const handleInput = (index: number, raw: string) => {
    const val = raw.replace(/[^0-9]/g, '').slice(0, 1);

    setDigitAt(index, val);
    if (message) setMessage(null);
    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      setDigitAt(index - 1, '');
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && allFilled && !isBusy) {
      submitCode();
    }
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '');

    if (!pasted) return;
    const newDigits = [...digits];

    for (let i = 0; i < Math.min(pasted.length, OTP_LENGTH - index); i++) {
      newDigits[index + i] = pasted[i];
    }
    setDigits(newDigits);
    if (message) setMessage(null);
    const nextIdx = Math.min(index + pasted.length, OTP_LENGTH - 1);

    inputRefs.current[nextIdx]?.focus();
  };

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

  /**
   * Attempts to resend the OTP on the current flow.
   * Pure function — does NOT handle flow expiry. Caller decides recovery strategy.
   */
  async function resendOnCurrentFlow(signal: AbortSignal): Promise<'sent' | 'flow_expired' | 'failed'> {
    const currentFlow = flowRef.current;
    const resp = await fetch(currentFlow.ui.action, {
      method: 'POST',
      credentials: 'include',
      signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        method: LOGIN_METHODS.CODE,
        resend: 'code',
        csrf_token: getCsrfToken(currentFlow.ui.nodes),
        ...collectHiddenNodeValues(currentFlow.ui.nodes),
      }),
    });

    if (resp.status === API_STATUS_CODES.GONE) return 'flow_expired';
    if (resp.status >= 500) return 'failed';

    const data = await resp.json();
    const codeSent =
      data.state === 'sent_email' ||
      data.ui?.messages?.some((m: FlowUiMessage) => m.type === 'info' && RESEND_SUCCESS_MESSAGE_IDS.includes(m.id));

    if (codeSent) updateFlowUi(data);

    return codeSent ? 'sent' : 'failed';
  }

  // ── Response Handlers (for submitCode) ──────────────────────────

  function handleSubmitSuccess(data: { continue_with?: { redirect_browser_to?: string }[] }): void {
    setStatus('success');
    setToLocalStorage(LOCAL_STORAGE_KEYS.LAST_LOGIN_INFO, JSON.stringify({ email, method: 'code' }));
    const redirectUrl = data.continue_with?.[0]?.redirect_browser_to;

    window.location.href = redirectUrl || window.location.href;
  }

  function handleLocationChange(data: { redirect_browser_to?: string }): void {
    if (data.redirect_browser_to) {
      window.location.href = data.redirect_browser_to;
    } else {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }
  }

  /**
   * 410 handler — uses timestamp comparison (Approach 1) with network fallback (Approach 2).
   *
   * Approach 1: Compare response.expired_at vs flow.expires_at
   *   - expired_at < flow.expires_at  → code expired, flow alive → resend on same flow
   *   - expired_at >= flow.expires_at → flow expired → create new flow via onFlowExpired
   *
   * Approach 2 (fallback if timestamps unparseable): try resend, if 410 again → new flow
   */
  async function handleExpired(data: FlowExpiredResponse, signal: AbortSignal): Promise<void> {
    clearDigitsAndFocus();

    const responseExpiredAt = new Date(data.expired_at).getTime();
    const flowExpiresAt = new Date(flowRef.current.expires_at).getTime();
    const canParseTimestamps = !isNaN(responseExpiredAt) && !isNaN(flowExpiresAt);

    if (canParseTimestamps && responseExpiredAt < flowExpiresAt) {
      // CODE expired, flow still alive — resend on same flow
      const result = await resendOnCurrentFlow(signal);

      if (result === 'sent') {
        setMessage({ type: 'info', text: 'Code expired. New code sent to your email.' });
      } else {
        setMessage({ type: 'error', text: 'Code expired. Please click Resend to get a new code.' });
      }
    } else if (canParseTimestamps) {
      // FLOW expired — create entirely new flow
      const newFlow = await onFlowExpired();

      if (newFlow) {
        setMessage({ type: 'info', text: 'Session expired. New code sent to your email.' });
      } else {
        setMessage({ type: 'error', text: 'Session expired. Please try again.' });
      }
    } else {
      // Timestamps unparseable — fallback to Approach 2 (try resend, infer from result)
      const result = await resendOnCurrentFlow(signal);

      if (result === 'sent') {
        setMessage({ type: 'info', text: 'Code expired. New code sent to your email.' });
      } else if (result === 'flow_expired') {
        const newFlow = await onFlowExpired();

        if (newFlow) {
          setMessage({ type: 'info', text: 'Session expired. New code sent to your email.' });
        } else {
          setMessage({ type: 'error', text: 'Session expired. Please try again.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
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

    const isInvalidCode = data.ui?.messages?.some((m: FlowUiMessage) => INVALID_CODE_MESSAGE_IDS.includes(m.id));

    if (isInvalidCode) {
      setMessage({ type: 'error', text: 'Incorrect code. Please try again.' });
    } else {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }
  }

  // ── Core Actions ────────────────────────────────────────────────

  const submitCode = async () => {
    if (isBusy) return;
    const code = digits.join('');

    if (code.length !== OTP_LENGTH) return;

    setStatus('submitting');
    setMessage(null);

    try {
      const currentFlow = flowRef.current;
      const controller = makeAbortController();

      const resp = await fetch(currentFlow.ui.action, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          method: LOGIN_METHODS.CODE,
          code,
          csrf_token: getCsrfToken(currentFlow.ui.nodes),
          ...collectHiddenNodeValues(currentFlow.ui.nodes),
        }),
      });

      if (resp.status === API_STATUS_CODES.OK) {
        handleSubmitSuccess(await resp.json());

        return;
      }
      if (resp.status === API_STATUS_CODES.UNPROCESSABLE_ENTITY) {
        handleLocationChange(await resp.json());

        return;
      }
      if (resp.status === API_STATUS_CODES.GONE) {
        await handleExpired(await resp.json(), controller.signal);

        return;
      }
      if (resp.status === API_STATUS_CODES.BAD_REQUEST) {
        handleSubmitBadRequest(await resp.json());

        return;
      }

      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setStatus((prev) => (prev === 'success' ? prev : 'idle'));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isBusy) return;

    setStatus('resending');
    setMessage(null);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    try {
      const controller = makeAbortController();
      const result = await resendOnCurrentFlow(controller.signal);

      if (result === 'sent') {
        setMessage({ type: 'info', text: 'New code sent to your email.' });
      } else if (result === 'flow_expired') {
        const newFlow = await onFlowExpired();

        if (newFlow) {
          setMessage({ type: 'info', text: 'Session expired. New code sent to your email.' });
        } else {
          setMessage({ type: 'error', text: 'Session expired. Please try again.' });
          setResendCooldown(0);
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to resend code. Please try again.' });
        setResendCooldown(0);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setMessage({ type: 'error', text: 'Failed to resend code. Please try again.' });
      setResendCooldown(0);
    } finally {
      setStatus('idle');
    }
  };

  // ── Render ──────────────────────────────────────────────────────

  const isError = message?.type === 'error';

  return (
    <div>
      <div className='mb-8 text-center'>
        <h2 className='mb-2.5 text-xl font-semibold text-[#1a1a1a]'>Confirm your email</h2>
        <p className='text-[13px] leading-relaxed text-[#888]'>
          Enter the code we sent to
          <br />
          <span className='inline-flex items-center gap-1.5'>
            <span className='font-medium text-[#333]'>{email}</span>
            <button
              type='button'
              onClick={onEditEmail}
              disabled={isBusy}
              className={`inline-flex items-center border-none bg-transparent p-0.5 transition-colors duration-200 ${
                isBusy ? 'cursor-not-allowed text-[#ccc]' : 'cursor-pointer text-[#999] hover:text-[#1a1a1a]'
              }`}
              title='Edit email'
            >
              <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M10.08 1.92a1.25 1.25 0 0 1 1.77 0l.23.23a1.25 1.25 0 0 1 0 1.77L5.33 10.67l-2.5.5.5-2.5L10.08 1.92Z'
                  stroke='currentColor'
                  strokeWidth='1.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M8.75 3.25l2 2'
                  stroke='currentColor'
                  strokeWidth='1.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </span>
        </p>
      </div>

      <div className='mb-7 flex justify-center gap-2.5'>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type='text'
            inputMode='numeric'
            maxLength={1}
            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
            value={digit}
            onChange={(e) => handleInput(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={(e) => handlePaste(idx, e)}
            onFocus={(e) => e.target.select()}
            disabled={isBusy}
            className={`h-14 w-12 rounded-xl border bg-white text-center text-[22px] font-semibold text-[#1a1a1a] transition-all duration-250 outline-none ${
              isError
                ? 'border-[#e53935] shadow-[0_0_0_3px_rgba(229,57,53,0.08)] focus:border-[#e53935] focus:shadow-[0_0_0_3px_rgba(229,57,53,0.12)]'
                : digit
                  ? 'border-black/18 focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]'
                  : 'border-black/10 focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]'
            }`}
            style={{ caretColor: 'transparent' }}
          />
        ))}
      </div>

      {message && (
        <p className={`-mt-4 mb-4 text-center text-xs ${isError ? 'text-[#e53935]' : 'text-[#666]'}`}>{message.text}</p>
      )}

      <button
        type='button'
        onClick={submitCode}
        disabled={!allFilled || isBusy}
        className={`relative w-full overflow-hidden rounded-2xl px-5 py-3.5 text-sm font-medium transition-all duration-250 ${
          allFilled && !isBusy
            ? 'cursor-pointer bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] active:scale-[0.98]'
            : 'cursor-not-allowed bg-[#d0d0d0] text-[#999]'
        }`}
      >
        {status === 'submitting' || status === 'success' ? 'Verifying...' : 'Verify'}
      </button>

      <p className='mt-6 text-center text-[13px] text-[#999]'>
        Didn&apos;t receive a code?{' '}
        <button
          type='button'
          onClick={handleResend}
          disabled={resendCooldown > 0 || isBusy}
          className={`border-none bg-transparent font-medium transition-colors duration-150 ${
            resendCooldown > 0 || isBusy
              ? 'cursor-not-allowed text-[#bbb] no-underline'
              : 'cursor-pointer text-[#333] underline underline-offset-2 hover:text-[#1a1a1a]'
          }`}
          style={{ fontFamily: 'inherit', fontSize: '13px' }}
        >
          {status === 'resending' ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </button>
      </p>
    </div>
  );
};
