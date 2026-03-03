'use client';

import { useEffect, useRef, useState } from 'react';
import { ProfessionRevealBackground } from 'modules/login/ProfessionRevealBackground';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { PendingWaitlistStep } from 'modules/onboarding/steps/PendingWaitlistStep';
import { SetupProfileStep } from 'modules/onboarding/steps/SetupProfileStep';
import { SetupUsernameStep } from 'modules/onboarding/steps/SetupUsernameStep';
import { SetupWorkspaceStep } from 'modules/onboarding/steps/SetupWorkspaceStep';
import { UpdateOrgStep } from 'modules/onboarding/steps/UpdateOrgStep';
import { WelcomeStep } from 'modules/onboarding/steps/WelcomeStep';
import { useRouter } from 'next/navigation';
import { useWhoAmIQuery } from '@/apis/auth';
import { ROUTES_PATH } from '@/constants/routeConfig';

// FunnelDisplay font via Google Fonts (inline style to avoid modifying global layout)
const funnelDisplayFont = `
@import url('https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700&display=swap');
`;

export const OnboardingRoot = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session, isLoading } = useWhoAmIQuery();
  const [currentStatus, setCurrentStatus] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    if (!session) return;

    const status = session.onboarding_status as OnboardingStatus | null;

    if (!status || status === OnboardingStatus.ONBOARDED) {
      router.replace(ROUTES_PATH.PROCESSES);

      return;
    }

    setCurrentStatus(status);
  }, [session, router]);

  const handleStepComplete = (nextStatus: OnboardingStatus) => {
    if (nextStatus === OnboardingStatus.ONBOARDED) {
      router.replace(ROUTES_PATH.PROCESSES);

      return;
    }

    setCurrentStatus(nextStatus);
  };

  if (isLoading || !currentStatus) {
    return (
      <div className='bg-GRAY_100 flex h-screen w-screen items-center justify-center'>
        <style>{funnelDisplayFont}</style>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black' />
      </div>
    );
  }

  // Welcome screen is full-page (no card wrapper)
  if (currentStatus === OnboardingStatus.WELCOME) {
    return (
      <>
        <style>{funnelDisplayFont}</style>
        <WelcomeStep session={session!} onComplete={handleStepComplete} />
      </>
    );
  }

  return (
    <div className='bg-GRAY_100 relative flex h-screen w-screen items-center justify-center overflow-hidden'>
      <style>{funnelDisplayFont}</style>
      <ProfessionRevealBackground containerRef={containerRef} />

      <div ref={containerRef} className='relative z-2 w-full max-w-[520px] px-6 py-10'>
        {/* Step content */}
        <StepContent status={currentStatus} session={session!} onComplete={handleStepComplete} />
      </div>
    </div>
  );
};

type StepContentProps = {
  status: OnboardingStatus;
  session: NonNullable<ReturnType<typeof useWhoAmIQuery>['data']>;
  onComplete: (next: OnboardingStatus) => void;
};

const StepContent = ({ status, session, onComplete }: StepContentProps) => {
  switch (status) {
    case OnboardingStatus.SETUP_PROFILE:
      return <SetupProfileStep initialName={session.display_name || session.user_name || ''} onComplete={onComplete} />;

    case OnboardingStatus.SETUP_USERNAME:
      return <SetupUsernameStep initialUsername={session.username || ''} onComplete={onComplete} />;

    case OnboardingStatus.UPDATE_ORG:
      return <UpdateOrgStep onComplete={onComplete} />;

    case OnboardingStatus.PENDING_WAITLIST:
      return <PendingWaitlistStep onComplete={onComplete} />;

    case OnboardingStatus.SETUP_WORKSPACE:
      return <SetupWorkspaceStep userId={session.user_id} onComplete={onComplete} />;

    default:
      return null;
  }
};
