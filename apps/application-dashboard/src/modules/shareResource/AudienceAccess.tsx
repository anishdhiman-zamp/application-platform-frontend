import { FC, useRef, useState } from 'react';
import { COLORS } from 'constants/colors';
import { JOINED_DATASET_ICON } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import RemoveFromTeamPopup from 'modules/team/components/RemoveFromTeamPopup';
import Image from 'next/image';
import { ResourceAudienceType } from 'types/api/auth.types';
import { checkIfCurrentUser } from 'utils/accessPermission/accessPermission.utils';
import { cn, convertEmailUsernameToName, getUserNameFromEmail } from 'utils/common';
import { ResourcePrivilege, ResourceType, TeamInfoType } from '@/modules/shareResource/shareResource.types';
import { OptionsType } from '@/types/commonTypes';
import AsyncDropdown from 'components/asyncDropdown/AsyncDropdown';
import Avatar from 'components/common/avatar';
import { toast } from 'components/common/toast/Toast';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type AudienceAccessPropsType = {
  resourceType: ResourceType;
  privilege: string;
  changeRole: (resourceAudienceId: string, role: string) => Promise<boolean>;
  deleteAudience: (resourceAudienceId: string, userName: string) => Promise<void>;
  privilegeList: ResourcePrivilege[];
  resourceAudienceId: string;
  resourceAudienceType: string;
  user: {
    name?: string;
    email?: string;
  };
  userPrivilege: string;
  currentUserHasAdminAccess: boolean;
  orgName: string;
  customerName: string;
  teamInfo: TeamInfoType;
  isDeletingAudience: boolean;
  isChangingRole: boolean;
  currentUserId: string;
};

const AudienceAccess: FC<AudienceAccessPropsType> = ({
  resourceType,
  privilege,
  changeRole,
  deleteAudience,
  privilegeList,
  resourceAudienceId,
  user,
  currentUserHasAdminAccess,
  resourceAudienceType,
  orgName,
  customerName,
  teamInfo,
  isDeletingAudience,
  currentUserId,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const role = privilegeList.find((r) => r.value === privilege);
  const [isOpenRemoveFromTeamPopup, setIsOpenRemoveFromTeamPopup] = useState<boolean>(false);
  const [isHoveredDropdown, setIsHoveredDropdown] = useState<boolean>(false);
  const [openChangeRoleDropdown, setOpenChangeRoleDropdown] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<ResourcePrivilege>(role as ResourcePrivilege);
  const checkIfUser = checkIfCurrentUser(user?.email ?? '');
  const checkIfResourceTypeOrg = resourceAudienceType === ResourceAudienceType.ORGANIZATION;
  const checkIfResourceTypeTeam = resourceAudienceType === ResourceAudienceType.TEAM;
  const userName = checkIfResourceTypeOrg
    ? orgName
    : checkIfResourceTypeTeam
      ? teamInfo?.name
      : convertEmailUsernameToName(getUserNameFromEmail(user?.email || resourceAudienceType)) || 'Unknown';
  const customAvatarWord = (checkIfResourceTypeOrg ? customerName : userName) || 'Unknown';
  const showRoleChangeDropdown =
    currentUserHasAdminAccess &&
    !(currentUserId == resourceAudienceId && resourceAudienceType === ResourceAudienceType.USER);

  const handleOpenChangeRoleDropdown = () => {
    setOpenChangeRoleDropdown(true);
  };

  const handleCloseChangeRoleDropdown = () => {
    setOpenChangeRoleDropdown(false);
  };

  const handleOpenRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(true);
  };

  const handleCloseRemoveFromTeamPopup = () => {
    setIsOpenRemoveFromTeamPopup(false);
  };

  const handleRoleChange = async (selectedOption: OptionsType) => {
    await changeRole(resourceAudienceId, selectedOption.value.toString())
      .then((success) => {
        if (!success) {
          setSelectedRole(role as ResourcePrivilege);

          return;
        }
        setSelectedRole(
          privilegeList.find((r) => r.value === selectedOption.value && r.kind === resourceType) as ResourcePrivilege,
        );
        setOpenChangeRoleDropdown(false);
        setIsHoveredDropdown(false);
      })
      .catch((err) => {
        toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_ROLE_CHANGED);
        setSelectedRole(role as ResourcePrivilege);
      });
  };

  const handleDeleteAudience = async () => {
    deleteAudience(resourceAudienceId, userName || '')
      .then(() => {
        handleCloseRemoveFromTeamPopup();
      })
      .catch((err) => {
        handleCloseRemoveFromTeamPopup();
        toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_DELETED);
      });
  };

  useOnClickOutside(dropdownRef, handleCloseChangeRoleDropdown);

  return (
    <>
      <div className='f-12-400 pl-2 bg-white flex justify-between items-center'>
        <div className='flex items-center justify-start'>
          <div className='flex items-start justify-start gap-x-1 w-[140px]'>
            <div className='flex items-center gap-1'>
              {checkIfResourceTypeTeam ? (
                <div>
                  <SvgSpriteLoader id='users-02' width={14} height={14} color={COLORS.GRAY_1000} className='mr-0.5' />
                </div>
              ) : (
                <div className='w-fit'>
                  <Avatar
                    name={customAvatarWord}
                    backgroundColor={COLORS.GRAY_1000}
                    className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
                  />
                </div>
              )}
              <div
                className={cn(
                  'flex justify-center items-center gap-1 whitespace-nowrap',
                  checkIfResourceTypeTeam && 'px-1.5 py-0.5 rounded',
                )}
                style={{
                  backgroundColor: checkIfResourceTypeTeam ? teamInfo?.color : 'transparent',
                }}
              >
                {userName}
                <span className='f-12-400 text-GRAY_700'>{checkIfUser && '(You)'}</span>
              </div>
            </div>
          </div>
          <span className='hidden text-wrap flex-wrap break-words whitespace-normal items-center justify-start gap-1 w-[100px]'>
            {currentUserHasAdminAccess && (
              <>
                <Image src={JOINED_DATASET_ICON} alt='joined-dataset-icon' width={16} height={16} />
                {resourceType}
              </>
            )}
          </span>
        </div>

        {showRoleChangeDropdown ? (
          <AsyncDropdown
            onOpen={handleOpenChangeRoleDropdown}
            onClose={handleCloseChangeRoleDropdown}
            isOpen={openChangeRoleDropdown}
            onDelete={handleOpenRemoveFromTeamPopup}
            onChange={(role: OptionsType) => handleRoleChange(role)}
            options={privilegeList}
            selectedValue={selectedRole}
            defaultValue={role as ResourcePrivilege}
            showDelete
            showSelectedIcon
            isHoveredDropdown={isHoveredDropdown}
            setIsHoveredDropdown={setIsHoveredDropdown}
            isOverflowStyle
          />
        ) : (
          <span
            className={cn(
              'flex justify-between items-start f-12-400 text-GRAY_1000 pl-4 py-3 pr-2',
              !showRoleChangeDropdown && 'pr-4 text-GRAY_600',
            )}
          >
            {role?.label}
          </span>
        )}
      </div>
      <RemoveFromTeamPopup
        isOpen={isOpenRemoveFromTeamPopup}
        onClose={handleCloseRemoveFromTeamPopup}
        onDelete={handleDeleteAudience}
        isLoading={isDeletingAudience}
        feature='remove-access-from-page'
        warningDescription={`${userName} will be immediately removed from ${resourceType} and lose all access`}
      />
    </>
  );
};

export default AudienceAccess;
