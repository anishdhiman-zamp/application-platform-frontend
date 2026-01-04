import React, { lazy, RefObject, useMemo, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import MembersEmail from 'modules/team/components/members/MembersEmail';
import MembersName from 'modules/team/components/members/MembersName';
import MembersRole from 'modules/team/components/members/MembersRole';
import MembersTeamV2 from 'modules/team/components/members/MembersTeamV2';
import { UserMappedTeamType } from 'modules/team/people.types';
import { useDeleteAudienceFromOrganizationAccessMutation, useGetAudiencesByOrganisationIdQuery } from '@/apis/people';
import { toast } from '@/components/common/toast/Toast';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { useUserIdentity } from '@/hooks/useUserIdentity';
import { GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import { PERMISSION_MESSAGES } from '@/utils/accessPermission/accessPermission.constants';
import { PERMISSION_TYPES } from '@/utils/accessPermission/accessPermission.types';
import { convertEmailUsernameToName, getUserNameFromEmail } from '@/utils/common';

const RemoveFromTeamPopup = lazy(() => import('modules/team/components/RemoveFromTeamPopup'));

interface TeamMemberCardProps {
  member: boolean;
  row: {
    email: string;
    name: string;
    user_id: string;
    privilege: string;
    teams: UserMappedTeamType[];
  };
  organizationId: string;
  teamsData: GetTeamsByOrganizationIdResponseType[];
  hasPeoplePolicy: boolean;
  teamsRandomColorRef: RefObject<() => string>;
  value: {
    user_id: string;
    userEmail: string;
    privilege: string;
  };
}

const TeamMemberCard = ({
  member = false,
  value,
  row,
  organizationId,
  teamsData,
  hasPeoplePolicy,
  teamsRandomColorRef,
}: TeamMemberCardProps) => {
  const { user_id, userEmail } = value;
  const { isSystemAdmin } = useUserIdentity();
  const [isOpenRemoveFromTeamPopup, setIsOpenRemoveFromTeamPopup] = useState<boolean>(false);
  const userName = useMemo(() => convertEmailUsernameToName(getUserNameFromEmail(userEmail ?? '')), [userEmail]);
  const checkPermission = isSystemAdmin && member;
  const [deleteAudience, { isLoading: isLoadingDeleteAudience }] = useDeleteAudienceFromOrganizationAccessMutation();
  const { refetch: refetchAudiencesByOrganizationId } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );

  const handleDeleteAudience = () => {
    if (!checkPermission) {
      toast.error(PERMISSION_MESSAGES[PERMISSION_TYPES.DELETE]);

      return;
    }

    deleteAudience({
      organizationId: organizationId,
      body: {
        user_id: user_id,
      },
    })
      .unwrap()
      .then((res) => {
        refetchAudiencesByOrganizationId();
        handleCloseRemoveFromTeamPopup();
        toast.success(res?.message || `Removed ${userName} successfully`);
      })
      .catch((err) => {
        handleCloseRemoveFromTeamPopup();
        toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_DELETED);
      });
  };

  const handleOpenRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(true);
  };

  const handleCloseRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(false);
  };

  return (
    <div className='border-b-0.5 border-DIVIDER_GRAY group relative grid grid-cols-4 gap-4'>
      <MembersName name={row?.name || row?.email} value={row?.email} member />
      <MembersEmail value={row?.email} />
      <MembersRole
        value={{ user_id: row?.user_id, privilege: row?.privilege, userEmail: row?.email }}
        member
        hasPeoplePolicy={hasPeoplePolicy}
      />
      <MembersTeamV2
        userInfo={{ user_id: row?.user_id, name: row?.name, email: row?.email }}
        organizationId={organizationId}
        teamsData={teamsData ?? []}
        userId={row?.user_id}
        userMappedTeams={row?.teams}
        hasPeoplePolicy={hasPeoplePolicy}
        teamsRandomColorRef={teamsRandomColorRef}
      />
      <div className='absolute top-2 right-0'>
        <div className='flex h-full items-center justify-end'>
          <Button
            variant='ghost'
            size='small'
            className='h-6 w-6 opacity-0 group-hover:opacity-100'
            onClick={() => handleOpenRemoveFromTeamPopup()}
          >
            <SvgSpriteLoader id='trash-01' className='text-GRAY_900' size={12} />
          </Button>
        </div>
      </div>
      {isOpenRemoveFromTeamPopup && (
        <RemoveFromTeamPopup
          isOpen={isOpenRemoveFromTeamPopup}
          onClose={handleCloseRemoveFromTeamPopup}
          isLoading={isLoadingDeleteAudience}
          onDelete={handleDeleteAudience}
          feature='remove-access-from-dataset'
          warningDescription={`${userName} will be immediately removed from the organization and lose all access`}
        />
      )}
    </div>
  );
};

export default TeamMemberCard;
