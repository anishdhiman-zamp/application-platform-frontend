'use client';

import { FC, useEffect, useState } from 'react';
import { captureException } from '@sentry/browser';
import { useLazyWhoAmIQuery } from 'apis/auth';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from 'apis/people';
import { ROUTES_PATH } from 'constants/routeConfig';
import ZampLogoLoader from '@/components/common/loader/ZampLogoLoader';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

export const HandleInvitations: FC = () => {
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
              window.location.href = ROUTES_PATH.PROCESSES;
            }
          });
        });
      } else {
        if (isInvitationsPage) {
          window.location.href = ROUTES_PATH.PROCESSES;
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
          <ZampLogoLoader />
        </div>
      }
    >
      {null}
    </CommonWrapper>
  );
};
