'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingStatus, ProvisioningStatus } from 'modules/onboarding/onboarding.types';
import { useLazyGetProvisioningStatusQuery } from '@/apis/onboarding';

type Props = {
  userId: string;
  organizationId: string;
  onComplete: (status: OnboardingStatus) => void;
};

type ScreenState = 'loading' | 'taking_longer' | 'failed';

export const SetupWorkspaceStep = ({ userId, organizationId, onComplete }: Props) => {
  const [fetchStatus] = useLazyGetProvisioningStatusQuery();
  const [screenState, setScreenState] = useState<ScreenState | null>(null); // null until first poll resolves
  const completedRef = useRef(false);

  const handleOnboarded = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(OnboardingStatus.ONBOARDED);
  }, [onComplete]);

  const checkStatus = useCallback(async () => {
    if (completedRef.current) return;
    try {
      const result = await fetchStatus({ organization_id: organizationId }, false).unwrap();

      if (result.provisioning_status === ProvisioningStatus.FAILED) {
        setScreenState('failed');

        return;
      }

      // Check if taking longer than threshold (before completed check so UI updates even if redirect fails)
      if (result.provisioning_started_at && result.email_threshold_seconds) {
        const elapsed = (Date.now() - new Date(result.provisioning_started_at).getTime()) / 1000;

        setScreenState(elapsed > result.email_threshold_seconds ? 'taking_longer' : 'loading');
      } else {
        setScreenState('loading');
      }

      if (result.onboarding_status === 'onboarded' || result.provisioning_status === ProvisioningStatus.COMPLETED) {
        handleOnboarded();

        return;
      }
    } catch {
      // ignore polling errors
    }
  }, [fetchStatus, organizationId, handleOnboarded]);

  // SSE: listen for onboarding_status_changed event
  useEffect(() => {
    const trySubscribe = () => {
      const bus = (window as any).__sseEventBus;

      if (!bus) return false;
      const unsubscribe = bus.subscribe(
        'onboarding',
        (data: { payload?: { type: string; status: string; user_id: string } }) => {
          if (
            data?.payload?.type === 'onboarding_status_changed' &&
            data?.payload?.status === 'onboarded' &&
            data?.payload?.user_id === userId
          ) {
            handleOnboarded();
          }
        },
      );

      return unsubscribe;
    };

    let unsubscribe: (() => void) | false = false;
    let attempts = 0;
    const retryInterval = setInterval(() => {
      attempts++;
      unsubscribe = trySubscribe();
      if (unsubscribe || attempts >= 10) clearInterval(retryInterval);
    }, 500);

    return () => {
      clearInterval(retryInterval);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [userId, handleOnboarded]);

  // Poll provisioning status every 5s, max 100 attempts
  const pollCountRef = useRef(0);

  useEffect(() => {
    checkStatus();
    pollCountRef.current = 1;

    const poll = setInterval(() => {
      if (pollCountRef.current >= 100 || completedRef.current) {
        clearInterval(poll);

        return;
      }
      pollCountRef.current += 1;
      checkStatus();
    }, 5000);

    return () => clearInterval(poll);
  }, [checkStatus]);

  if (!screenState) return null;

  if (screenState === 'failed') {
    return (
      <div className='flex w-full max-w-[520px] flex-col'>
        <div className='mb-8'>
          <ErrorIcon />
        </div>
        <h2
          className='mb-3'
          style={{
            fontSize: 48,
            lineHeight: 1.3,
            fontFamily: "'FunnelDisplay', serif",
            color: '#1a1a1a',
            fontWeight: 300,
          }}
        >
          Something went wrong.
        </h2>
        <p className='text-sm' style={{ color: '#999', lineHeight: 1.6 }}>
          We couldn&rsquo;t set up your workspace. Please contact support for help.
        </p>
      </div>
    );
  }

  if (screenState === 'taking_longer') {
    return (
      <div className='flex w-full max-w-[520px] flex-col'>
        <div className='mb-8'>
          <Spinner />
        </div>
        <h2
          className='mb-3'
          style={{
            fontSize: 48,
            lineHeight: 1.3,
            fontFamily: "'FunnelDisplay', serif",
            color: '#1a1a1a',
            fontWeight: 300,
          }}
        >
          Taking a bit longer&hellip;
        </h2>
        <p className='text-sm' style={{ color: '#999', lineHeight: 1.6 }}>
          We&rsquo;ll email you when your workspace is ready.
          <br />
          You can close this tab and come back later.
        </p>
      </div>
    );
  }

  return (
    <div className='flex w-full max-w-[520px] flex-col'>
      <div className='mb-8 flex items-center gap-4'>
        <Spinner />
      </div>
      <h2
        className='mb-3'
        style={{
          fontSize: 48,
          lineHeight: 1.3,
          fontFamily: "'FunnelDisplay', serif",
          color: '#1a1a1a',
          fontWeight: 300,
        }}
      >
        Setting up your workspace&hellip;
      </h2>
      <p className='text-sm' style={{ color: '#999', lineHeight: 1.6 }}>
        This usually takes just a moment.
        <br />
        You&rsquo;ll be redirected automatically.
      </p>
    </div>
  );
};

const Spinner = () => (
  <svg
    className='animate-spin'
    width='32'
    height='32'
    viewBox='0 0 32 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle cx='16' cy='16' r='12' stroke='#e5e5e5' strokeWidth='3' />
    <path d='M16 4a12 12 0 0 1 12 12' stroke='#1a1a1a' strokeWidth='3' strokeLinecap='round' />
  </svg>
);

const ErrorIcon = () => (
  <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='48' height='48' rx='12' fill='#FEF2F2' />
    <path d='M24 16v8M24 28h.01' stroke='#EF4444' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    <circle cx='24' cy='24' r='10' stroke='#EF4444' strokeWidth='2' />
  </svg>
);
