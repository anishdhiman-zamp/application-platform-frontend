'use client';

import { FC, useEffect, useState } from 'react';
import { captureException } from '@sentry/browser';
import { useLazyWhoAmIQuery } from 'apis/auth';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from 'apis/people';
import { ROUTES_PATH } from 'constants/routeConfig';
import { usePathname } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

export const HandleInvitations: FC = () => {
  const [handledInvitations, setHandledInvitations] = useState<string[]>([]);
  const pathname = usePathname();

  const isInvitationsPage = pathname === ROUTES_PATH.INVITATIONS;

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
              window.location.href = ROUTES_PATH.PROCESS;
            }
          });
        });
      } else {
        if (isInvitationsPage) {
          window.location.href = ROUTES_PATH.PROCESS;
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
        <ImageLoader
          imageSrc={ZAMP_LOGO_LOADER_SVG}
          width={140}
          height={140}
          data-testid='handle-invitations-wrapper'
          className='z-1000'
        />
      }
    >
      {null}
    </CommonWrapper>
  );
};
