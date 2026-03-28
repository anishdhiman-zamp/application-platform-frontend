'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProfessionRevealBackground } from 'modules/login/ProfessionRevealBackground';
import { ProvisioningScreen } from 'modules/setup-workspace/components/ProvisioningScreen';
import {
  MEDIA_TYPE,
  PROVISIONING_POLL_INTERVAL_MS,
  PROVISIONING_STATUS,
} from 'modules/setup-workspace/setup-workspace.constants';
import { useRouter } from 'next/navigation';
import { useLazyWhoAmIQuery, useWhoAmIQuery } from '@/apis/auth';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from '@/apis/people';
import { useProvisionOrgMutation, useRegisterOrgMutation } from '@/apis/setup-workspace';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { setUser } from '@/store/slices/user';
import { clearCookie, USER_SESSION_COOKIE } from '@/utils/cookie';

const MAX_POLL_ATTEMPTS = 60; // 5 minutes at 5s intervals

const deriveOrgName = (displayName: string | undefined, email: string): string => {
  const firstName = displayName?.trim() || email.split('@')[0].replace(/^./, (c) => c.toUpperCase());

  return `${firstName}'s Organization`;
};

export const SetupWorkspaceRoot = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isEnabled: isAutoOrgEnabled, isLoading: isFlagLoading } = useFeatureFlag(FEATURE_FLAGS.AUTO_ORG_CREATION);
  const flagReady = !isFlagLoading && isAutoOrgEnabled;
  const [takingLonger, setTakingLonger] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { data: session, isLoading: sessionLoading } = useWhoAmIQuery(undefined, { skip: !flagReady });
  const { data: invitationsData, isLoading: invitationsLoading } = useGetMyInvitationsQuery(undefined, {
    skip: !flagReady,
  });
  const [acceptInvitation] = useAcceptInvitationMutation();
  const [fetchWhoAmI] = useLazyWhoAmIQuery();
  const [registerOrg] = useRegisterOrgMutation();
  const [provisionOrg] = useProvisionOrgMutation();

  const redirectToApp = useCallback(() => {
    clearCookie(USER_SESSION_COOKIE);
    router.replace(ROUTES_PATH.HOME);
  }, [router]);

  const pollProvisioning = useCallback(
    async (orgId: string) => {
      let attempts = 0;

      const poll = async () => {
        attempts++;

        try {
          const result = await provisionOrg(orgId).unwrap();

          if (result.expected_completion_seconds && result.started_at) {
            const elapsed = (Date.now() - new Date(result.started_at).getTime()) / 1000;

            if (elapsed > result.expected_completion_seconds) {
              setTakingLonger(true);
            }
          }

          if (result.is_completed || result.provisioning_status === PROVISIONING_STATUS.COMPLETED) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            redirectToApp();

            return true;
          }
        } catch {
          // keep polling — backend self-heals
        }

        if (attempts >= MAX_POLL_ATTEMPTS) {
          setHasError(true);

          return true;
        }

        return false;
      };

      if (await poll()) return;

      pollingIntervalRef.current = setInterval(async () => {
        if (await poll()) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          pollingIntervalRef.current = null;
        }
      }, PROVISIONING_POLL_INTERVAL_MS);
    },
    [provisionOrg, redirectToApp],
  );

  const acceptPendingInvitations = useCallback(async () => {
    const invitations = invitationsData?.invitations ?? [];

    if (invitations.length === 0) return false;

    for (const inv of invitations) {
      try {
        await acceptInvitation({ invitationId: inv.organization_invitation_id });
      } catch {
        //
      }
    }

    try {
      const refreshed = await fetchWhoAmI(undefined, false).unwrap();

      if (refreshed.orgs && refreshed.orgs.length > 0) {
        redirectToApp();

        return true;
      }
    } catch {
      //
    }

    return false;
  }, [invitationsData, acceptInvitation, fetchWhoAmI, redirectToApp]);

  const createAndProvision = useCallback(
    async (userId: string, displayName: string | undefined, email: string) => {
      const orgName = deriveOrgName(displayName, email);

      try {
        const result = await registerOrg({
          organization_name: orgName,
          owner_id: userId,
          icon_type: MEDIA_TYPE.SEED,
          icon_value: orgName,
        }).unwrap();

        const orgId = result.organization.organization_id;

        const refreshed = await fetchWhoAmI(undefined, false).unwrap();

        dispatch(setUser(refreshed));

        await pollProvisioning(orgId);
      } catch {
        setHasError(true);
      }
    },
    [registerOrg, fetchWhoAmI, dispatch, pollProvisioning],
  );

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isFlagLoading) return;

    if (!isAutoOrgEnabled) {
      router.replace(ROUTES_PATH.MEMBERSHIP_PENDING);
    }
  }, [isFlagLoading, isAutoOrgEnabled, router]);

  useEffect(() => {
    if (startedRef.current) return;
    if (isFlagLoading || !isAutoOrgEnabled) return;
    if (sessionLoading || !session || !session.orgs || session.orgs.length === 0) return;

    const org = session.orgs[0];

    if (org.provisioning_status === PROVISIONING_STATUS.COMPLETED) {
      redirectToApp();

      return;
    }

    startedRef.current = true;
    dispatch(setUser(session));
    pollProvisioning(org.organization_id);
  }, [session, sessionLoading, dispatch, pollProvisioning, isFlagLoading, isAutoOrgEnabled, redirectToApp]);

  useEffect(() => {
    if (isFlagLoading || !isAutoOrgEnabled) return;
    if (sessionLoading || invitationsLoading || !session || startedRef.current) return;
    if (session.orgs && session.orgs.length > 0) return;
    startedRef.current = true;

    const run = async () => {
      const accepted = await acceptPendingInvitations();

      if (accepted) return;

      await createAndProvision(session.user_id, session.user_name, session.user_email);
    };

    run();
  }, [
    isFlagLoading,
    isAutoOrgEnabled,
    sessionLoading,
    invitationsLoading,
    session,
    acceptPendingInvitations,
    createAndProvision,
  ]);

  if (!flagReady || sessionLoading || !session) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return (
    <div className='bg-GRAY_100 relative flex h-screen w-screen items-center justify-center overflow-hidden'>
      <ProfessionRevealBackground containerRef={containerRef} />

      <div ref={containerRef} className='relative z-2 w-full max-w-[520px] px-6 py-10'>
        <ProvisioningScreen takingLonger={takingLonger} hasError={hasError} userName={session?.user_email || ''} />
      </div>
    </div>
  );
};
