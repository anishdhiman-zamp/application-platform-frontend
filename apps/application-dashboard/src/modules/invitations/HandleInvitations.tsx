'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { captureException } from '@sentry/browser';
import { REGIONS_MAP } from '@zamp-platform/api';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@zamp-platform/utils';
import { useLazyWhoAmIQuery } from 'apis/auth';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from 'apis/people';
import { ZAMP_LOGO_LOADER } from 'constants/lottie/zamp-logo-loader';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useRouter } from 'next/navigation';
import { MembershipRequested } from '@/components/MembershipRequested';
import { useLogout } from '@/hooks/useLogout';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from 'components/DynamicLottiePlayer';

export const HandleInvitations: FC = () => {
  const router = useRouter();
  const isMultiRegion = useMemo(() => {
    return JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.ALL_REGIONS) || '[]').length > 1;
  }, []);

  const [regionDetails, setRegionDetails] = useState({
    currentRegion: '',
    invitationRegion: '',
  });
  const [handledInvitations, setHandledInvitations] = useState<string[]>([]);

  const { data: invitationsData, isLoading: loadingInvitations } = useGetMyInvitationsQuery();
  const [whoAmI] = useLazyWhoAmIQuery();
  const { logout } = useLogout();
  const [acceptInvitation] = useAcceptInvitationMutation();

  const subtitle = useMemo(() => {
    {
      return `It looks like you're currently logged in with the ${REGIONS_MAP[(regionDetails.currentRegion as keyof typeof REGIONS_MAP) ?? 'us']?.label} region. To access this invitation, please log out and log in again with the ${REGIONS_MAP[(regionDetails.invitationRegion as keyof typeof REGIONS_MAP) ?? 'us']?.label} region.`;
    }
  }, [regionDetails]);

  const logoutButton = {
    text: 'Logout',
    onClick: logout,
  };

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
      //current signed in region
      const region = getFromLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION);
      const formattedRegion = region?.length ? region.replace('-', '') : 'us';
      // get region from url params, set signed in region if not present
      const urlParams = new URLSearchParams(window.location.search);
      const regionFromUrlParams = urlParams.get('region')?.toLowerCase() || formattedRegion;

      if (formattedRegion !== regionFromUrlParams && isMultiRegion) {
        setRegionDetails({
          currentRegion: formattedRegion,
          invitationRegion: regionFromUrlParams?.replace('-', ''),
        });

        return;
      }

      // use finally because we don't want to block the flow if invitation acceptance fails
      if (invitationsData) {
        handleAcceptInvitations(
          invitationsData.invitations.map((invitation) => invitation.organization_invitation_id),
        ).finally(() => {
          whoAmI().finally(() => {
            router.push(ROUTES_PATH.HOME);
          });
        });
      } else {
        router.push(ROUTES_PATH.HOME);
      }
    }
  }, [invitationsData, loadingInvitations]);

  if (regionDetails.currentRegion !== regionDetails.invitationRegion && isMultiRegion) {
    return (
      <div className='fixed inset-0 z-1000 flex h-screen w-screen bg-white'>
        <MembershipRequested
          text={`You're logged in with a different region`}
          subText={subtitle}
          actionItems={[logoutButton]}
        />
      </div>
    );
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
