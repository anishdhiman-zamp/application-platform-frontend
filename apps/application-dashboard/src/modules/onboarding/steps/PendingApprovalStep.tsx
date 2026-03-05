'use client';

import { useEffect, useRef, useState } from 'react';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useCheckApprovalMutation } from '@/apis/onboarding';

type Props = {
  onComplete: (status: OnboardingStatus) => void;
  onWrongStep: () => void;
  onFlagDisabled: () => void;
};

export const PendingApprovalStep = ({ onComplete, onWrongStep, onFlagDisabled }: Props) => {
  const [checkApproval] = useCheckApprovalMutation();
  const [checked, setChecked] = useState(false);
  const calledRef = useRef(false);

  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const check = async () => {
      try {
        const result = await checkApproval().unwrap();

        if (result.is_approved && result.onboarding_status !== OnboardingStatus.PENDING_APPROVAL) {
          onCompleteRef.current(result.onboarding_status);

          return;
        }

        setChecked(true);
      } catch (err) {
        const noopSetError = () => {};

        if (!handleOnboardingApiError(err, { setError: noopSetError, onWrongStep, onFlagDisabled })) {
          setChecked(true);
        }
      }
    };

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return (
      <div className='flex w-full max-w-[520px] items-center justify-center py-20'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black' />
      </div>
    );
  }

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
