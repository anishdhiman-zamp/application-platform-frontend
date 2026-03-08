'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingStatus, ProvisioningStatus } from 'modules/onboarding/onboarding.types';
import { useEnsureProvisioningMutation } from '@/apis/onboarding';

type Props = {
  organizationId: string;
  onComplete: (status: OnboardingStatus) => void;
};

type ScreenState = 'loading' | 'taking_longer';

export const SetupWorkspaceStep = ({ organizationId, onComplete }: Props) => {
  const [ensureProvisioning] = useEnsureProvisioningMutation();
  const [screenState, setScreenState] = useState<ScreenState | null>(null);
  const completedRef = useRef(false);

  const handleOnboarded = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(OnboardingStatus.ONBOARDED);
  }, [onComplete]);

  const checkStatus = useCallback(async () => {
    if (completedRef.current) return;
    try {
      const result = await ensureProvisioning({ organization_id: organizationId }).unwrap();

      // Check if taking longer than threshold
      if (result.provisioning_started_at && result.expected_completion_seconds) {
        const elapsed = (Date.now() - new Date(result.provisioning_started_at).getTime()) / 1000;

        setScreenState(elapsed > result.expected_completion_seconds ? 'taking_longer' : 'loading');
      } else {
        setScreenState('loading');
      }

      if (result.onboarding_status === 'onboarded' || result.provisioning_status === ProvisioningStatus.COMPLETED) {
        handleOnboarded();
      }
    } catch {
      // Ignore errors and continue polling — backend self-heals failed workflows
      if (!screenState) setScreenState('loading');
    }
  }, [ensureProvisioning, organizationId, handleOnboarded, screenState]);

  // Poll every 5s
  const pollCountRef = useRef(0);

  useEffect(() => {
    checkStatus();
    pollCountRef.current = 1;

    const poll = setInterval(() => {
      if (completedRef.current) {
        clearInterval(poll);

        return;
      }
      pollCountRef.current += 1;
      checkStatus();
    }, 5000);

    return () => clearInterval(poll);
  }, [checkStatus]);

  if (!screenState) return null;

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
