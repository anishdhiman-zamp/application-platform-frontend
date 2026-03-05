'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProfessionRevealBackground } from 'modules/login/ProfessionRevealBackground';
import { OnboardingStatus } from 'modules/onboarding/onboarding.types';
import { PendingApprovalStep } from 'modules/onboarding/steps/PendingApprovalStep';
import { SetupProfileStep } from 'modules/onboarding/steps/SetupProfileStep';
import { SetupUsernameStep } from 'modules/onboarding/steps/SetupUsernameStep';
import { SetupWorkspaceStep } from 'modules/onboarding/steps/SetupWorkspaceStep';
import { UpdateOrgStep } from 'modules/onboarding/steps/UpdateOrgStep';
import { WELCOME_SEEN_KEY, WelcomeStep } from 'modules/onboarding/steps/WelcomeStep';
import { useRouter } from 'next/navigation';
import { useWhoAmIQuery } from '@/apis/auth';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';

// FunnelDisplay font via Google Fonts (inline style to avoid modifying global layout)
const funnelDisplayFont = `
@import url('https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700&display=swap');
`;

const isWelcomeSeen = () => {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

export const OnboardingRoot = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session, isLoading, refetch: refetchSession } = useWhoAmIQuery();
  const [currentStatus, setCurrentStatus] = useState<OnboardingStatus | null>(null);
  const [orgIdFromSetup, setOrgIdFromSetup] = useState<string | null>(null);
  const [welcomeSeen, setWelcomeSeen] = useState(isWelcomeSeen());
  const { isEnabled: isOnboardingEnabled, isLoading: isFlagLoading } = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_ONBOARDING_FLOW,
  );
  const { isPaceChatEnabled } = useIsPaceChatEnabled();
  const landingRoute = isPaceChatEnabled ? ROUTES_PATH.CHAT : ROUTES_PATH.PROCESSES;

  // If feature flag is off, skip onboarding entirely — follow old app flow
  useEffect(() => {
    if (isFlagLoading) return;
    if (!isOnboardingEnabled) {
      router.replace(landingRoute);
    }
  }, [isFlagLoading, isOnboardingEnabled, router]);

  useEffect(() => {
    if (!session || isFlagLoading || !isOnboardingEnabled) return;

    const status = session.onboarding_status as OnboardingStatus | null;

    if (!status) {
      router.replace(landingRoute);

      return;
    }

    if (status === OnboardingStatus.ONBOARDED) {
      if (isWelcomeSeen()) {
        router.replace(landingRoute);

        return;
      }
      // Welcome animation not seen yet — let it play before redirecting
    }

    setCurrentStatus(status);
  }, [session, router, isFlagLoading, isOnboardingEnabled]);

  // If we reach SETUP_WORKSPACE without orgIdFromSetup (e.g. page reload), refetch session to get fresh org data
  useEffect(() => {
    if (currentStatus === OnboardingStatus.SETUP_WORKSPACE && !orgIdFromSetup && !session?.orgs?.[0]?.organization_id) {
      refetchSession();
    }
  }, [currentStatus, orgIdFromSetup, session, refetchSession]);

  const handleStepComplete = (nextStatus: OnboardingStatus, organizationId?: string) => {
    if (nextStatus === OnboardingStatus.ONBOARDED) {
      router.replace(landingRoute);

      return;
    }

    if (organizationId) {
      setOrgIdFromSetup(organizationId);
    }

    setWelcomeSeen(isWelcomeSeen());
    setCurrentStatus(nextStatus);
  };

  // 400 "wrong step" → re-fetch session to get correct onboarding_status
  const handleWrongStep = useCallback(() => {
    refetchSession();
  }, [refetchSession]);

  // 403 "feature flag off" → silently exit onboarding, follow old app flow
  const handleFlagDisabled = useCallback(() => {
    router.replace(landingRoute);
  }, [router, landingRoute]);

  if (isLoading || isFlagLoading || !currentStatus) {
    return (
      <div className='bg-GRAY_100 flex h-screen w-screen items-center justify-center'>
        <style>{funnelDisplayFont}</style>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black' />
      </div>
    );
  }

  // Fresh welcome flow — reset the flag so animation plays from scratch
  if (currentStatus === OnboardingStatus.WELCOME) {
    try {
      localStorage.removeItem(WELCOME_SEEN_KEY);
    } catch {
      // localStorage may be unavailable
    }
  }

  // Welcome screen is full-page (no card wrapper)
  // Also show welcome animation for setup_workspace/onboarded if the user hasn't seen it yet (e.g. reload mid-animation)
  const showWelcomeAnimation =
    currentStatus === OnboardingStatus.WELCOME ||
    ((currentStatus === OnboardingStatus.SETUP_WORKSPACE || currentStatus === OnboardingStatus.ONBOARDED) &&
      !welcomeSeen);

  if (showWelcomeAnimation) {
    const isReload = currentStatus !== OnboardingStatus.WELCOME;

    return (
      <>
        <style>{funnelDisplayFont}</style>
        <WelcomeStep
          organizationId={orgIdFromSetup || session!.orgs?.[0]?.organization_id || null}
          onComplete={handleStepComplete}
          onWrongStep={handleWrongStep}
          onFlagDisabled={handleFlagDisabled}
          skipApi={isReload}
          nextStatus={isReload ? currentStatus : undefined}
        />
      </>
    );
  }

  return (
    <div className='bg-GRAY_100 relative flex h-screen w-screen items-center justify-center overflow-hidden'>
      <style>{funnelDisplayFont}</style>
      <ProfessionRevealBackground containerRef={containerRef} />

      <div ref={containerRef} className='relative z-2 w-full max-w-[520px] px-6 py-10'>
        {/* Step content */}
        <StepContent
          status={currentStatus}
          session={session!}
          onComplete={handleStepComplete}
          orgIdFromSetup={orgIdFromSetup}
          onWrongStep={handleWrongStep}
          onFlagDisabled={handleFlagDisabled}
        />
      </div>
    </div>
  );
};

type StepContentProps = {
  status: OnboardingStatus;
  session: NonNullable<ReturnType<typeof useWhoAmIQuery>['data']>;
  onComplete: (next: OnboardingStatus, organizationId?: string) => void;
  orgIdFromSetup: string | null;
  onWrongStep: () => void;
  onFlagDisabled: () => void;
};

const StepContent = ({
  status,
  session,
  onComplete,
  orgIdFromSetup,
  onWrongStep,
  onFlagDisabled,
}: StepContentProps) => {
  switch (status) {
    case OnboardingStatus.SETUP_PROFILE:
      return (
        <SetupProfileStep
          initialName={[session.display_name, session.last_name].filter(Boolean).join(' ') || session.user_name || ''}
          onComplete={onComplete}
          onWrongStep={onWrongStep}
          onFlagDisabled={onFlagDisabled}
        />
      );

    case OnboardingStatus.SETUP_USERNAME:
      return (
        <SetupUsernameStep
          initialUsername={session.username || ''}
          onComplete={onComplete}
          onWrongStep={onWrongStep}
          onFlagDisabled={onFlagDisabled}
        />
      );

    case OnboardingStatus.SETUP_ORG:
      return <UpdateOrgStep onComplete={onComplete} onWrongStep={onWrongStep} onFlagDisabled={onFlagDisabled} />;

    case OnboardingStatus.PENDING_APPROVAL:
      return <PendingApprovalStep onComplete={onComplete} onWrongStep={onWrongStep} onFlagDisabled={onFlagDisabled} />;

    case OnboardingStatus.SETUP_WORKSPACE: {
      const resolvedOrgId = orgIdFromSetup || session.orgs?.[0]?.organization_id;

      if (!resolvedOrgId) return null; // wait for refetch to populate org ID

      return <SetupWorkspaceStep userId={session.user_id} organizationId={resolvedOrgId} onComplete={onComplete} />;
    }

    default:
      return null;
  }
};
