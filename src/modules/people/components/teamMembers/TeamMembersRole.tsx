import { FC, useRef, useState } from 'react';
import {
  useDeleteAudienceFromOrganizationAccessMutation,
  useGetAudiencesByOrganisationIdQuery,
  usePatchChangeAudienceRoleInOrganizationMutation,
} from 'apis/people';
import { useOnClickOutside } from 'hooks';
import { useAppSelector } from 'hooks/toolkit';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/people/people.constants';
import { TeamMemberAccessPrivilegesType, TeamMembersRolePropsType } from 'modules/people/people.types';
import RemoveFromTeamPopup from 'modules/people/RemoveFromTeamPopup';
import { RootState } from 'store';
import AsyncDropdown from 'components/asyncDropdown/AsyncDropdown';
import { toast } from 'components/common/toast/Toast';

const TeamMembersRole: FC<TeamMembersRolePropsType> = ({ value }) => {
  const { user_id, privilege } = value;
  const role = TEAM_MEMBERS_PRIVILEGES_LIST.find((role) => role?.value === privilege);
  const [isOpenRemoveFromTeamPopup, setIsOpenRemoveFromTeamPopup] = useState<boolean>(false);
  const [isHoveredDropdown, setIsHoveredDropdown] = useState<boolean>(false);
  const [openChangeRoleDropdown, setOpenChangeRoleDropdown] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<TeamMemberAccessPrivilegesType>(
    role as TeamMemberAccessPrivilegesType,
  );
  const [changeRole] = usePatchChangeAudienceRoleInOrganizationMutation();
  const [deleteAudience] = useDeleteAudienceFromOrganizationAccessMutation();
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { refetch: refetchAudiencesByOrganizationId } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId },
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenChangeRoleDropdown = () => {
    setOpenChangeRoleDropdown(true);
  };

  const handleCloseChangeRoleDropdown = () => {
    setOpenChangeRoleDropdown(false);
  };

  const handleRoleChange = (selectedOption: TeamMemberAccessPrivilegesType) => {
    changeRole({
      organizationId: organizationId,
      body: {
        user_id: user_id,
        role: selectedOption?.value,
      },
    })
      .unwrap()
      .then(() => {
        setSelectedRole(selectedOption);
        setOpenChangeRoleDropdown(false);
        setIsHoveredDropdown(false);
        refetchAudiencesByOrganizationId();
        toast.success('Role changed successfully');
      })
      .catch((err) => {
        toast.error(err?.data?.error || 'Failed to change role');
      });
  };

  const handleOpenRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(true);
  };

  const handleCloseRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(false);
  };

  const handleDeleteAudience = async () => {
    try {
      await deleteAudience({
        organizationId: organizationId,
        body: {
          user_id: user_id,
        },
      }).unwrap();
      handleCloseRemoveFromTeamPopup();
      refetchAudiencesByOrganizationId();
      toast.success('Audience deleted successfully');
    } catch {
      handleCloseRemoveFromTeamPopup();
      toast.error('Failed to delete audience');
    }
  };

  useOnClickOutside(dropdownRef, handleCloseChangeRoleDropdown);

  return (
    <div className='w-full h-full text-left'>
      <div className='relative w-fit'>
        <AsyncDropdown
          onOpen={handleOpenChangeRoleDropdown}
          onClose={handleCloseChangeRoleDropdown}
          isOpen={openChangeRoleDropdown}
          onDelete={handleOpenRemoveFromTeamPopup}
          onChange={(role) => handleRoleChange(role as TeamMemberAccessPrivilegesType)}
          options={TEAM_MEMBERS_PRIVILEGES_LIST}
          selectedValue={selectedRole}
          defaultValue={role as TeamMemberAccessPrivilegesType}
          showDelete
          isHoveredDropdown={isHoveredDropdown}
          setIsHoveredDropdown={setIsHoveredDropdown}
          showSelectedIcon
          parentWrapperClassName='pl-2'
          wrapperClassName='w-[200px]'
          selectedOptionClassName='bg-GRAY_100'
        />
      </div>
      <RemoveFromTeamPopup
        isOpen={isOpenRemoveFromTeamPopup}
        onClose={handleCloseRemoveFromTeamPopup}
        onDelete={handleDeleteAudience}
        feature='remove-access-from-dataset'
        warningDescription={` will be immediately removed from and lose all access`}
      />
    </div>
  );
};

export default TeamMembersRole;
