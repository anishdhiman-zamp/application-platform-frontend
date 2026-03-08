'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaType } from 'modules/onboarding/onboarding.types';
import { useRouter } from 'next/navigation';
import { useLazyWhoAmIQuery, useWhoAmIQuery } from '@/apis/auth';
import { useProvisionOrgMutation, useRegisterOrgMutation } from '@/apis/onboarding';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from '@/apis/people';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';

type Phase = 'checking_invitations' | 'creating_org' | 'provisioning' | 'error';

const deriveOrgName = (displayName: string | undefined, email: string): string => {
  const firstName = displayName?.trim() || email.split('@')[0].replace(/^./, (c) => c.toUpperCase());

  return `${firstName}'s Organization`;
};

export const SetupWorkspaceRoot = () => {
  const router = useRouter();
  const { data: session, isLoading: sessionLoading } = useWhoAmIQuery();
  const { isPaceChatEnabled } = useIsPaceChatEnabled();
  const landingRoute = isPaceChatEnabled ? ROUTES_PATH.CHAT : ROUTES_PATH.PROCESSES;

  const [phase, setPhase] = useState<Phase>('checking_invitations');
  const [takingLonger, setTakingLonger] = useState(false);
  const startedRef = useRef(false);

  const { data: invitationsData, isLoading: invitationsLoading } = useGetMyInvitationsQuery();
  const [acceptInvitation] = useAcceptInvitationMutation();
  const [fetchWhoAmI] = useLazyWhoAmIQuery();
  const [registerOrg] = useRegisterOrgMutation();
  const [provisionOrg] = useProvisionOrgMutation();

  // If user already has orgs, redirect immediately
  useEffect(() => {
    if (!sessionLoading && session && session.orgs && session.orgs.length > 0) {
      router.replace(landingRoute);
    }
  }, [session, sessionLoading, router, landingRoute]);

  const pollProvisioning = useCallback(
    async (orgId: string) => {
      setPhase('provisioning');

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
      setPhase('creating_org');
      const orgName = deriveOrgName(displayName, email);

      try {
        const result = await registerOrg({
          organization_name: orgName,
          owner_id: userId,
          icon_type: MediaType.SEED,
          icon_value: orgName,
        }).unwrap();

        const orgId = result.organization.organization_id;

        await pollProvisioning(orgId);
      } catch {
        setPhase('error');
      }
    },
    [registerOrg, pollProvisioning],
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

  const handleRetry = () => {
    if (!session) return;
    setPhase('creating_org');
    createAndProvision(session.user_id, session.display_name, session.user_email);
  };

  if (phase === 'error') {
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-white'>
        <div className='flex max-w-[520px] flex-col items-center text-center'>
          <p className='mb-4 text-sm' style={{ color: '#999' }}>
            Something went wrong while setting up your workspace.
          </p>
          <button
            type='button'
            onClick={handleRetry}
            className='rounded-lg bg-[#1a1a1a] px-6 py-2.5 text-sm text-white transition-opacity hover:opacity-80'
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

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
