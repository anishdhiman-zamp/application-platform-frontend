'use client';

import { FC, useEffect, useState } from 'react';
import { captureException } from '@sentry/browser';
import { useLazyWhoAmIQuery } from 'apis/auth';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from 'apis/people';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useRouter } from 'next/navigation';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';

export const HandleInvitations: FC = () => {
  const router = useRouter();

  const [handledInvitations, setHandledInvitations] = useState<string[]>([]);

  const isInvitationsPage = window.location.pathname === ROUTES_PATH.INVITATIONS;

  const { data: invitationsData, isLoading: loadingInvitations } = useGetMyInvitationsQuery();
  const [whoAmI] = useLazyWhoAmIQuery();
  const [acceptInvitation] = useAcceptInvitationMutation();

  const handleAcceptInvitations = async (invitationIds: string[]) => {
    for (const invitationId of invitationIds) {
      if (handledInvitations.includes(invitationId)) {
        continue;
      }

      setHandledInvitations((prev) => [...prev, invitationId]);

      try {
        await acceptInvitation({ invitationId: invitationId });
      } catch (error) {
        console.error(`failed to accept invitation ${invitationId}`, error);
        captureException(`failed to accept invitation ${invitationId}`, {
          extra: {
            error,
          },
        });
      }
    }
  };

  useEffect(() => {
    if (loadingInvitations === false) {
      // use finally because we don't want to block the flow if invitation acceptance fails

      if (invitationsData) {
        handleAcceptInvitations(
          invitationsData.invitations.map((invitation) => invitation.organization_invitation_id),
        ).finally(() => {
          whoAmI().finally(() => {
            if (isInvitationsPage || invitationsData.invitations.length > 0) {
              router.push(ROUTES_PATH.HOME);
            }
          });
        });
      } else {
        if (isInvitationsPage) {
          window.location.href = ROUTES_PATH.HOME;
        }
      }
    }
  }, [invitationsData, loadingInvitations]);

  if (!isInvitationsPage) {
    return null;
  }

  return (
    <CommonWrapper
      className='h-full'
      isLoading={true}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <div
          className='z-1000 flex h-full w-full items-center justify-center bg-white'
          data-testid='handle-invitations-wrapper'
        >
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
      }
    >
      {null}
    </CommonWrapper>
  );
};
