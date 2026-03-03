'use client';

import { useEffect } from 'react';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { useLazyWhoAmIQuery } from '@/apis/auth';

type Props = {
  onComplete: (status: OnboardingStatus) => void;
};

export const PendingWaitlistStep = ({ onComplete }: Props) => {
  const [fetchWhoAmI] = useLazyWhoAmIQuery();

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const result = await fetchWhoAmI().unwrap();

        if (result.onboarding_status && result.onboarding_status !== OnboardingStatus.PENDING_WAITLIST) {
          clearInterval(poll);
          onComplete(result.onboarding_status as OnboardingStatus);
        }
      } catch {
        // ignore polling errors
      }
    }, 10000);

    return () => clearInterval(poll);
  }, [fetchWhoAmI, onComplete]);

  return (
    <div className='flex w-full max-w-[520px] flex-col'>
      <div className='mb-8'>
        <WaitlistIcon />
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
        You&rsquo;re on the list.
      </h2>
      <p className='text-sm' style={{ color: '#999', lineHeight: 1.6 }}>
        We&rsquo;ll notify you when your access is approved.
        <br />
        This page will update automatically.
      </p>
    </div>
  );
};

const WaitlistIcon = () => (
  <svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect width='48' height='48' rx='12' fill='#f5f5f5' />
    <path d='M24 14v10l6 3' stroke='#888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    <circle cx='24' cy='24' r='10' stroke='#888' strokeWidth='2' />
  </svg>
);
