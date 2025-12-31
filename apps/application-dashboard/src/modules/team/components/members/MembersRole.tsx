import { FC, useRef, useState } from 'react';
import { useGetAudiencesByOrganisationIdQuery, usePatchChangeAudienceRoleInOrganizationMutation } from 'apis/people';
import { useOnClickOutside } from 'hooks';
import { useAppSelector } from 'hooks/toolkit';
import {
  MembersRolePropsType,
  TEAM_MEMBERS_PRIVILEGES_LIST,
  TeamMemberAccessPrivilegesType,
} from 'modules/team/people.types';
import { RootState } from 'store';
import { accessPermissionForPeople } from 'utils/accessPermission/accessPermission';
import { PERMISSION_MESSAGES } from 'utils/accessPermission/accessPermission.constants';
import { PERMISSION_TYPES } from 'utils/accessPermission/accessPermission.types';
import AsyncDropdown from 'components/asyncDropdown/AsyncDropdown';
import { toast } from 'components/common/toast/Toast';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';

const MembersRole: FC<MembersRolePropsType> = ({ value, member = false, hasPeoplePolicy }) => {
  const { user_id, privilege } = value;
  const role = TEAM_MEMBERS_PRIVILEGES_LIST.find((role) => role?.value === privilege);
  const [isHoveredDropdown, setIsHoveredDropdown] = useState<boolean>(false);
  const [openChangeRoleDropdown, setOpenChangeRoleDropdown] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<TeamMemberAccessPrivilegesType>(
    role as TeamMemberAccessPrivilegesType,
  );
  const [changeRole] = usePatchChangeAudienceRoleInOrganizationMutation();
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { refetch: refetchAudiencesByOrganizationId } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId, refetchOnMountOrArgChange: false },
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const checkPermission = accessPermissionForPeople() && member;

  const handleOpenChangeRoleDropdown = () => {
    setOpenChangeRoleDropdown(true);
  };

  const handleCloseChangeRoleDropdown = () => {
    setOpenChangeRoleDropdown(false);
  };

  const handleRoleChange = (selectedOption: TeamMemberAccessPrivilegesType) => {
    if (!checkPermission) {
      toast.error(PERMISSION_MESSAGES[PERMISSION_TYPES.ROLE_CHANGE]);

      return;
    } else {
      changeRole({
        organizationId: organizationId,
        body: {
          user_id: user_id,
          role: selectedOption?.value,
        },
      })
        .unwrap()
        .then((res) => {
          if (!hasPeoplePolicy) setSelectedRole(selectedOption);
          setOpenChangeRoleDropdown(false);
          setIsHoveredDropdown(false);
          refetchAudiencesByOrganizationId();
          toast.success(hasPeoplePolicy ? res?.message : TOAST_MESSAGES.SUCCESS_AUDIENCE_ROLE_CHANGED);
        })
        .catch((err) => {
          toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_ROLE_CHANGED);
        });
    }
  };

  useOnClickOutside(dropdownRef, handleCloseChangeRoleDropdown);

  return (
    <div className='h-full w-full text-left'>
      {checkPermission ? (
        <div className='relative w-fit'>
          <AsyncDropdown
            onOpen={handleOpenChangeRoleDropdown}
            onClose={handleCloseChangeRoleDropdown}
            isOpen={openChangeRoleDropdown}
            onChange={(role) => handleRoleChange(role as TeamMemberAccessPrivilegesType)}
            options={TEAM_MEMBERS_PRIVILEGES_LIST}
            selectedValue={selectedRole}
            defaultValue={role as TeamMemberAccessPrivilegesType}
            showSelectedIcon
            isHoveredDropdown={isHoveredDropdown}
            setIsHoveredDropdown={setIsHoveredDropdown}
            parentWrapperClassName='pl-2'
            wrapperClassName='w-[200px]'
            selectedOptionClassName='!bg-GRAY_100 py-2.5!'
          />
        </div>
      ) : (
        <span className='f-12-400 text-GRAY_1000 flex items-start justify-between py-3 pr-2 pl-2'>{role?.label}</span>
      )}
    </div>
  );
};

export default MembersRole;
