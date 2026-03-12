'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { ProvisioningScreen } from 'modules/setup-workspace/components/ProvisioningScreen';
import { useEnsureProvisioningMutation } from '@/apis/onboarding';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

type Props = {
  organizationId: string;
  userName: string;
  onComplete: (status: OnboardingStatus) => void;
};

const POLLING_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes at 5s intervals

export const SetupWorkspaceStep = ({ organizationId, userName, onComplete }: Props) => {
  const completedRef = useRef(false);
  const readyRef = useRef(false);
  const attemptsRef = useRef(0);

  const [ensureProvisioning] = useEnsureProvisioningMutation();

  const [takingLonger, setTakingLonger] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [ready, setReady] = useState(false);

  const handleOnboarded = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(OnboardingStatus.ONBOARDED);
  }, [onComplete]);

  const checkStatus = useCallback(async () => {
    if (completedRef.current) return;

    attemptsRef.current++;

    if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
      setHasError(true);

      return;
    }

    try {
      const result = await ensureProvisioning({ organization_id: organizationId }).unwrap();

      if (result.status.started_at && result.status.expected_completion_seconds) {
        const elapsed = (Date.now() - new Date(result.status.started_at).getTime()) / 1000;

        if (elapsed > result.status.expected_completion_seconds) {
          setTakingLonger(true);
        }
      }

      if (result.onboarding_status === OnboardingStatus.ONBOARDED || result.status.is_completed) {
        handleOnboarded();

        return;
      }

      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
    } catch {
      // Ignore errors and continue polling — backend self-heals failed workflows
      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
    }
  }, [ensureProvisioning, organizationId, handleOnboarded]);

  useEffect(() => {
    checkStatus();

    const poll = setInterval(() => {
      if (completedRef.current || hasError) {
        clearInterval(poll);

        return;
      }
      checkStatus();
    }, POLLING_INTERVAL);

    return () => clearInterval(poll);
  }, [checkStatus, hasError]);

  if (!ready)
    return (
      <div className='fixed inset-0 z-50'>
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />
      </div>
    );

  return <ProvisioningScreen takingLonger={takingLonger} hasError={hasError} userName={userName} />;
};
