import { FC, useRef, useState } from 'react';
import {
  useDeleteAudienceFromOrganizationAccessMutation,
  useGetInvitedAudiencesByOrganisationIdQuery,
  usePatchChangeAudienceRoleInOrganizationMutation,
} from 'apis/people';
import { useAppSelector } from 'hooks/toolkit';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/people/people.constants';
import { TeamMemberAccessPrivilegesType, TeamMembersRolePropsType } from 'modules/people/people.types';
import RemoveFromTeamPopup from 'modules/people/RemoveFromTeamPopup';
import { RootState } from 'store';
import { defaultFn } from 'types/commonTypes';
import { Dropdown } from 'components/common/dropdown';
import { toast } from 'components/common/toast/Toast';

const TeamMembersRole: FC<TeamMembersRolePropsType> = ({ value }) => {
  const { user_id, privilege } = value;

  const role = TEAM_MEMBERS_PRIVILEGES_LIST.find((role) => role?.value === privilege);
  const selectedRoleRef = useRef<TeamMemberAccessPrivilegesType>(TEAM_MEMBERS_PRIVILEGES_LIST[0]);
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';

  const { refetch: refetchAudiencesByOrganizationId } = useGetInvitedAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId },
  );
  const [changeRole] = usePatchChangeAudienceRoleInOrganizationMutation();
  const [deleteAudience] = useDeleteAudienceFromOrganizationAccessMutation();
  const [isHoveredDropdown, setIsHoveredDropdown] = useState<boolean>(false);

  const handleRoleChange = async (selectedOption: TeamMemberAccessPrivilegesType) => {
    selectedRoleRef.current = selectedOption;
    const changedRole = selectedRoleRef.current.value;

    await changeRole({
      organizationId: organizationId,
      body: {
        user_id: user_id,
        role: changedRole,
      },
    })
      .unwrap()
      .then(() => {
        refetchAudiencesByOrganizationId();
        toast.success('Role changed successfully');
      })
      .catch(() => {
        toast.error('Failed to change role');
      });
  };

  const [isOpenRemoveFromTeamPopup, setIsOpenRemoveFromTeamPopup] = useState<boolean>(false);
  const handleOpenRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(true);
  };
  const handleCloseRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(false);
  };

  const handleDeleteAudience = async () => {
    await deleteAudience({
      organizationId: organizationId,
      body: {
        user_id: user_id,
      },
    })
      .unwrap()
      .then(() => {
        handleCloseRemoveFromTeamPopup();
        refetchAudiencesByOrganizationId();
        toast.success('Audience deleted successfully');
      })
      .catch(() => {
        handleCloseRemoveFromTeamPopup();
        toast.error('Failed to delete audience');
      });
  };

  return (
    <>
      <div className='flex gap-2 items-center h-full f-12-400 text-GRAY_1000'>{role?.label}</div>
      <span
        className='hidden items-end justify-end w-24 -mt-[12px]'
        onMouseEnter={() => setIsHoveredDropdown(true)}
        onMouseLeave={() => setIsHoveredDropdown(false)}
      >
        <Dropdown
          options={TEAM_MEMBERS_PRIVILEGES_LIST}
          id='members-change-role-dropdown'
          eventCallback={defaultFn}
          onChange={handleRoleChange}
          defaultValue={role}
          value={selectedRoleRef.current}
          placeholder='Member'
          isSearchable={false}
          enableDelete
          onClickDelete={handleOpenRemoveFromTeamPopup}
          customClass={{
            focus: 'none',
            border: 'transparent',
            fontSize: 'f-12-400',
          }}
          customClassNames={{
            placeholder: 'f-12-300',
          }}
          menuOptionClasses={{
            contentWrapper: 'py-2',
          }}
          isHoveredDropdown={isHoveredDropdown}
          showSelectedIcon
        />
      </span>
      <RemoveFromTeamPopup
        isOpen={isOpenRemoveFromTeamPopup}
        onClose={handleCloseRemoveFromTeamPopup}
        onDelete={handleDeleteAudience}
        feature='remove-access-from-organization'
      />
    </>
  );
};

export default TeamMembersRole;
