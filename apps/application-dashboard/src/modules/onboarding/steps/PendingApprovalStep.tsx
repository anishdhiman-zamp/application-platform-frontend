'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { OnboardingStatus, OnboardingStepCallbacks } from 'modules/onboarding/onboarding.types';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useCheckApprovalMutation } from '@/apis/onboarding';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import OrgMembershipPending from '@/modules/login/OrgMembershipPending';

type Props = OnboardingStepCallbacks & {
  email: string;
};

export const PendingApprovalStep = ({ email, onComplete, onWrongStep, onFlagDisabled }: Props) => {
  const [checkApproval] = useCheckApprovalMutation();
  const [checked, setChecked] = useState(false);
  const checkingRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const check = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;

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
    } finally {
      checkingRef.current = false;
    }
  }, [checkApproval, onWrongStep, onFlagDisabled]);

  // Check on mount
  useEffect(() => {
    check();
  }, [check]);

  // Re-check when user tabs back
  useEffect(() => {
    const handleFocus = () => check();

    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, [check]);

  if (!checked) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return (
    <div className='flex h-screen w-screen items-center justify-center bg-white'>
      <OrgMembershipPending email={email} />
    </div>
  );
};
