'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { EventBus } from '@zamp-platform/utils';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { handleOnboardingApiError } from 'modules/onboarding/utils/onboardingErrors';
import { useCheckApprovalMutation } from '@/apis/onboarding';
import { SSEProvider } from '@/app/_providers/sse-provider';
import OrgMembershipPending from '@/modules/login/OrgMembershipPending';

type Props = {
  email: string;
  onComplete: (status: OnboardingStatus) => void;
  onWrongStep: () => void;
  onFlagDisabled: () => void;
};

export const PendingApprovalStep = ({ email, onComplete, onWrongStep, onFlagDisabled }: Props) => {
  const [checkApproval] = useCheckApprovalMutation();
  const [checked, setChecked] = useState(false);
  const calledRef = useRef(false);
  const sseEventBus = useMemo(() => new EventBus(), []);

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
      <div className='flex h-screen w-screen items-center justify-center bg-white'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black' />
      </div>
    );
  }

  return (
    <SSEProvider sseEventBus={sseEventBus}>
      <div className='flex h-screen w-screen items-center justify-center bg-white'>
        <OrgMembershipPending email={email} />
      </div>
    </SSEProvider>
  );
};
