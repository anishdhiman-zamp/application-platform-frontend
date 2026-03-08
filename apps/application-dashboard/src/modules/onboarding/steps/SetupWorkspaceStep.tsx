'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProvisioningScreen } from 'modules/onboarding/components/ProvisioningScreen';
import { OnboardingStatus, ProvisioningStatus } from 'modules/onboarding/onboarding.types';
import { useEnsureProvisioningMutation } from '@/apis/onboarding';

type Props = {
  organizationId: string;
  onComplete: (status: OnboardingStatus) => void;
};

export const SetupWorkspaceStep = ({ organizationId, onComplete }: Props) => {
  const [ensureProvisioning] = useEnsureProvisioningMutation();
  const [takingLonger, setTakingLonger] = useState(false);
  const [ready, setReady] = useState(false);
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

      if (result.provisioning_started_at && result.expected_completion_seconds) {
        const elapsed = (Date.now() - new Date(result.provisioning_started_at).getTime()) / 1000;

        if (elapsed > result.expected_completion_seconds) {
          setTakingLonger(true);
        }
      }

      if (!ready) setReady(true);

      if (result.onboarding_status === 'onboarded' || result.provisioning_status === ProvisioningStatus.COMPLETED) {
        handleOnboarded();
      }
    } catch {
      // Ignore errors and continue polling — backend self-heals failed workflows
      if (!ready) setReady(true);
    }
  }, [ensureProvisioning, organizationId, handleOnboarded, ready]);

  useEffect(() => {
    checkStatus();

    const poll = setInterval(() => {
      if (completedRef.current) {
        clearInterval(poll);

        return;
      }
      checkStatus();
    }, 5000);

    return () => clearInterval(poll);
  }, [checkStatus]);

  if (!ready) return null;

  return <ProvisioningScreen takingLonger={takingLonger} />;
};
