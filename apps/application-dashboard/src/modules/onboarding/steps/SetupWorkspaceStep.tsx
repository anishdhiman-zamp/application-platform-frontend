'use client';

import { useCallback, useEffect, useRef } from 'react';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { useLazyWhoAmIQuery } from '@/apis/auth';

type Props = {
  userId: string;
  onComplete: (status: OnboardingStatus) => void;
};

export const SetupWorkspaceStep = ({ userId, onComplete }: Props) => {
  const [fetchWhoAmI] = useLazyWhoAmIQuery();
  const completedRef = useRef(false);

  const handleOnboarded = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(OnboardingStatus.ONBOARDED);
  }, [onComplete]);

  // SSE: listen for onboarding_status_changed event via the event bus
  useEffect(() => {
    // Try to get the SSE event bus from the window (set by SSEProvider)
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

    // Retry subscribing a few times in case the bus isn't ready yet
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

  // Fallback: poll whoami every 5 seconds
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const result = await fetchWhoAmI().unwrap();

        if (result.onboarding_status === 'onboarded') {
          clearInterval(poll);
          handleOnboarded();
        }
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearInterval(poll);
  }, [fetchWhoAmI, handleOnboarded]);

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
