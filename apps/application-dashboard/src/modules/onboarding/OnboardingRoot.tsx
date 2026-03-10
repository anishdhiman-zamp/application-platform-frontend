'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProfessionRevealBackground } from 'modules/login/ProfessionRevealBackground';
import { OnboardingStatus, OnboardingStepCallbacks } from 'modules/onboarding/onboarding.types';
import { PendingApprovalStep } from 'modules/onboarding/steps/PendingApprovalStep';
import { SetupProfileStep } from 'modules/onboarding/steps/SetupProfileStep';
import { SetupUsernameStep } from 'modules/onboarding/steps/SetupUsernameStep';
import { SetupWorkspaceStep } from 'modules/onboarding/steps/SetupWorkspaceStep';
import { UpdateOrgStep } from 'modules/onboarding/steps/UpdateOrgStep';
import { WELCOME_SEEN_KEY, WelcomeStep } from 'modules/onboarding/steps/WelcomeStep';
import { useRouter } from 'next/navigation';
import { useWhoAmIQuery } from '@/apis/auth';
import { useEnsureProvisioningMutation, useSkipOnboardingMutation } from '@/apis/onboarding';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

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
  const landingRoute = session?.orgs?.[0]?.product === 'macs' ? ROUTES_PATH.CHAT : ROUTES_PATH.PROCESSES;
  const [skipOnboarding] = useSkipOnboardingMutation();
  const [ensureProvisioning] = useEnsureProvisioningMutation();
  const skipCalledRef = useRef(false);

  // If feature flag is off, call POST /onboarding/skip to force-complete, then redirect
  useEffect(() => {
    if (isFlagLoading || isOnboardingEnabled || skipCalledRef.current) return;
    skipCalledRef.current = true;

    const doSkip = async () => {
      try {
        await skipOnboarding().unwrap();
      } catch {
        // Best-effort skip
      }
      router.replace(landingRoute);
    };

    doSkip();
  }, [isFlagLoading, isOnboardingEnabled, skipOnboarding, router, landingRoute]);

  useEffect(() => {
    if (!session || isFlagLoading || !isOnboardingEnabled) return;

    const status = session.onboarding_status;

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

  // Fire provisioning call immediately when entering SETUP_WORKSPACE (gives provisioning a head start during welcome animation)
  const provisioningFiredRef = useRef(false);

  useEffect(() => {
    if (currentStatus !== OnboardingStatus.SETUP_WORKSPACE || provisioningFiredRef.current) return;
    const resolvedOrgId = orgIdFromSetup || session?.orgs?.[0]?.organization_id;

    if (!resolvedOrgId) return;
    provisioningFiredRef.current = true;
    // Fire-and-forget — SetupWorkspaceStep will poll for status
    ensureProvisioning({ organization_id: resolvedOrgId })
      .unwrap()
      .catch(() => {});
  }, [currentStatus, orgIdFromSetup, session, ensureProvisioning]);

  const handleStepComplete = (nextStatus: OnboardingStatus, organizationId?: string) => {
    if (nextStatus === OnboardingStatus.ONBOARDED) {
      if (isWelcomeSeen()) {
        router.replace(landingRoute);

        return;
      }
      // Show welcome animation before entering the app (invited user path)
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

  // 403 "feature flag off" → call skip, then redirect to main app
  const handleFlagDisabled = useCallback(async () => {
    try {
      await skipOnboarding().unwrap();
    } catch {
      // Best-effort skip
    }
    router.replace(landingRoute);
  }, [skipOnboarding, router, landingRoute]);

  if (isLoading || isFlagLoading || !currentStatus) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  // Show welcome animation for setup_workspace/onboarded if the user hasn't seen it yet
  const showWelcomeAnimation =
    (currentStatus === OnboardingStatus.SETUP_WORKSPACE || currentStatus === OnboardingStatus.ONBOARDED) &&
    !welcomeSeen;

  if (showWelcomeAnimation) {
    return <WelcomeStep nextStatus={currentStatus} onComplete={handleStepComplete} />;
  }

  if (currentStatus === OnboardingStatus.PENDING_APPROVAL) {
    return (
      <PendingApprovalStep
        email={session!.user_email}
        onComplete={handleStepComplete}
        onWrongStep={handleWrongStep}
        onFlagDisabled={handleFlagDisabled}
      />
    );
  }

  return (
    <div className='bg-GRAY_100 relative flex h-screen w-screen items-center justify-center overflow-hidden'>
      <ProfessionRevealBackground containerRef={containerRef} />

      <div ref={containerRef} className='relative z-2 w-full max-w-[520px] px-6 py-10'>
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

type StepContentProps = OnboardingStepCallbacks & {
  status: OnboardingStatus;
  session: NonNullable<ReturnType<typeof useWhoAmIQuery>['data']>;
  orgIdFromSetup: string | null;
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

    case OnboardingStatus.SETUP_WORKSPACE: {
      const resolvedOrgId = orgIdFromSetup || session.orgs?.[0]?.organization_id;

      if (!resolvedOrgId) return null; // wait for refetch to populate org ID

      return (
        <SetupWorkspaceStep
          organizationId={resolvedOrgId}
          userName={session.username || session.user_email}
          onComplete={onComplete}
        />
      );
    }

    default:
      return null;
  }
};
