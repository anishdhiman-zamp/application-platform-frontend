'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaType } from 'modules/onboarding/onboarding.types';
import { useRouter } from 'next/navigation';
import { useLazyWhoAmIQuery, useWhoAmIQuery } from '@/apis/auth';
import { useProvisionOrgMutation, useRegisterOrgMutation } from '@/apis/onboarding';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from '@/apis/people';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { setUser } from '@/store/slices/user';

const MAX_REGISTER_RETRIES = 3;
const REGISTER_RETRY_DELAY = 5000;

const deriveOrgName = (displayName: string | undefined, email: string): string => {
  const firstName = displayName?.trim() || email.split('@')[0].replace(/^./, (c) => c.toUpperCase());

  return `${firstName}'s Organization`;
};

export const SetupWorkspaceRoot = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session, isLoading: sessionLoading } = useWhoAmIQuery();
  const { isPaceChatEnabled } = useIsPaceChatEnabled();
  const landingRoute = isPaceChatEnabled ? ROUTES_PATH.CHAT : ROUTES_PATH.PROCESSES;

  const [takingLonger, setTakingLonger] = useState(false);
  const startedRef = useRef(false);

  const { data: invitationsData, isLoading: invitationsLoading } = useGetMyInvitationsQuery();
  const [acceptInvitation] = useAcceptInvitationMutation();
  const [fetchWhoAmI] = useLazyWhoAmIQuery();
  const [registerOrg] = useRegisterOrgMutation();
  const [provisionOrg] = useProvisionOrgMutation();

  // If user already has orgs on initial load, check provisioning_status from whoami.
  // If all orgs are provisioned → redirect to app.
  // If any org is not yet provisioned (e.g. user closed tab mid-flow) → resume polling.
  useEffect(() => {
    if (startedRef.current) return;
    if (sessionLoading || !session || !session.orgs || session.orgs.length === 0) return;

    const org = session.orgs[0];

    if (org.provisioning_status === 'completed') {
      router.replace(landingRoute);

      return;
    }

    // Provisioning not complete — stay here and poll
    startedRef.current = true;
    dispatch(setUser(session));
    pollProvisioning(org.organization_id);
  }, [session, sessionLoading, router, landingRoute, dispatch, pollProvisioning]);

  const pollProvisioning = useCallback(
    async (orgId: string) => {
      const poll = async () => {
        try {
          const result = await provisionOrg(orgId).unwrap();

          if (result.expected_completion_seconds && result.started_at) {
            const elapsed = (Date.now() - new Date(result.started_at).getTime()) / 1000;

            if (elapsed > result.expected_completion_seconds) {
              setTakingLonger(true);
            }
          }

          if (result.is_completed || result.provisioning_status === 'completed') {
            router.replace(landingRoute);

            return true;
          }
        } catch {
          // Ignore errors, keep polling — backend self-heals
        }

        return false;
      };

      // First poll immediately
      if (await poll()) return;

      // Then poll every 5s
      const interval = setInterval(async () => {
        if (await poll()) {
          clearInterval(interval);
        }
      }, 5000);
    },
    [provisionOrg, router, landingRoute],
  );

  const createAndProvision = useCallback(
    async (userId: string, displayName: string | undefined, email: string) => {
      const orgName = deriveOrgName(displayName, email);

      for (let attempt = 0; attempt < MAX_REGISTER_RETRIES; attempt++) {
        try {
          const result = await registerOrg({
            organization_name: orgName,
            owner_id: userId,
            icon_type: MediaType.SEED,
            icon_value: orgName,
          }).unwrap();

          const orgId = result.organization.organization_id;

          // Refresh session so the new org appears in the Redux store
          // (baseQuery reads org ID from state for the x-zamp-organization-id header)
          const refreshed = await fetchWhoAmI().unwrap();

          dispatch(setUser(refreshed));

          await pollProvisioning(orgId);

          return;
        } catch {
          // Silent retry — keep showing the spinner
          if (attempt < MAX_REGISTER_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, REGISTER_RETRY_DELAY));
          }
        }
      }

      // All retries exhausted — keep showing spinner, user can reload
    },
    [registerOrg, fetchWhoAmI, dispatch, pollProvisioning],
  );

  // Main flow: try invitations first, then auto-create
  useEffect(() => {
    if (sessionLoading || invitationsLoading || !session || startedRef.current) return;
    // Don't start if user already has orgs
    if (session.orgs && session.orgs.length > 0) return;
    startedRef.current = true;

    const run = async () => {
      // Step 1: Accept pending invitations
      const invitations = invitationsData?.invitations ?? [];

      if (invitations.length > 0) {
        for (const inv of invitations) {
          try {
            await acceptInvitation({ invitationId: inv.organization_invitation_id });
          } catch {
            // Continue even if individual acceptance fails
          }
        }

        // Refresh session to see if we now have orgs
        const refreshed = await fetchWhoAmI().unwrap();

        if (refreshed.orgs && refreshed.orgs.length > 0) {
          router.replace(landingRoute);

          return;
        }
      }

      // Step 2: Auto-create org
      await createAndProvision(session.user_id, session.display_name, session.user_email);
    };

    run();
  }, [
    sessionLoading,
    invitationsLoading,
    session,
    invitationsData,
    acceptInvitation,
    fetchWhoAmI,
    router,
    landingRoute,
    createAndProvision,
  ]);

  return (
    <div className='flex h-screen w-screen items-center justify-center bg-white'>
      <div className='flex max-w-[520px] flex-col'>
        <div className='mb-8'>
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
        </div>
        <h2
          className='mb-3'
          style={{
            fontSize: 32,
            lineHeight: 1.3,
            color: '#1a1a1a',
            fontWeight: 400,
          }}
        >
          {takingLonger ? 'Taking a bit longer\u2026' : 'Setting up your workspace\u2026'}
        </h2>
        <p className='text-sm' style={{ color: '#999', lineHeight: 1.6 }}>
          {takingLonger ? (
            <>
              We&rsquo;ll email you when your workspace is ready.
              <br />
              You can close this tab and come back later.
            </>
          ) : (
            <>
              This usually takes just a moment.
              <br />
              You&rsquo;ll be redirected automatically.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
