import { FC, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from 'constants/colors';
import { JOINED_DATASET_ICON } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { useCurrentUser } from 'hooks/useUserPrivilege';
import ShareResourceAccessDetails from 'modules/shareResource/components/ShareResourceAccessDetails';
import CustomiseAccess from 'modules/shareResource/CustomiseAccess';
import {
  ACCESS_MESSAGES_ADMIN_ROLE,
  ACCESS_MESSAGES_CUSTOMISE_ACCESS,
} from 'modules/shareResource/shareResource.constants';
import RemoveFromTeamPopup from 'modules/team/components/RemoveFromTeamPopup';
import Image from 'next/image';
import { ResourceAudienceType } from 'types/api/auth.types';
import { FilterModelType } from 'types/components/table.type';
import { cn, convertEmailUsernameToName, getUserNameFromEmail } from 'utils/common';
import { convertToFilterModel } from '@/components/common/table/table.utils';
import { useFiltersContextStore, withFiltersContext } from '@/components/filter/filters.context';
import { ResourcePrivilege, ResourceType, TeamInfoType } from '@/modules/shareResource/shareResource.types';
import { OptionsType } from '@/types/commonTypes';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';
import AsyncDropdown from 'components/asyncDropdown/AsyncDropdown';
import Avatar from 'components/common/avatar';
import { toast } from 'components/common/toast/Toast';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';

type AudienceAccessPropsType = {
  resourceType: ResourceType;
  privilege: string;
  changeRole: (
    resourceAudienceId: string,
    role: string,
    fgacFilters?: FilterModelType | null,
    isRoleChange?: boolean,
    audienceType?: string,
  ) => Promise<boolean>;
  deleteAudience: (resourceAudienceId: string, userName: string, resourceAudienceType: string) => Promise<void>;
  privilegeList: ResourcePrivilege[];
  resourceAudienceId: string;
  resourceAudienceType: string;
  user: {
    name?: string;
    email?: string;
    type?: string;
  };
  userPrivilege: string;
  currentUserHasAdminAccess: boolean;
  orgName: string;
  customerName: string;
  teamInfo: TeamInfoType;
  isDeletingAudience: boolean;
  isChangingRole: boolean;
  currentUserId: string;
  emptyFiltersTitle: string;
  isCustomiseAccess?: boolean;
  fgacFilters?: FilterModelType;
  resourceId: string;
  fgacColor?: string;
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
  emptyFiltersTitle,
  isCustomiseAccess = false,
  fgacFilters,
  resourceId,
  isChangingRole = false,
  fgacColor,
}) => {
  const {
    state: { selectedFilters },
  } = useFiltersContextStore();
  const { isCurrentUser } = useCurrentUser();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const role = privilegeList.find((r) => r.value === privilege);
  const [isOpenRemoveFromTeamPopup, setIsOpenRemoveFromTeamPopup] = useState<boolean>(false);
  const [isHoveredDropdown, setIsHoveredDropdown] = useState<boolean>(false);
  const [openChangeRoleDropdown, setOpenChangeRoleDropdown] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<ResourcePrivilege>(role as ResourcePrivilege);
  const [showCustomiseAccess, setShowCustomiseAccess] = useState<boolean>(false);

  const checkIfUser = isCurrentUser(user?.email ?? '');
  const checkIfResourceTypeOrg = resourceAudienceType === ResourceAudienceType.ORGANIZATION;
  const checkIfResourceTypeTeam = resourceAudienceType === ResourceAudienceType.TEAM;
  const userName = checkIfResourceTypeOrg
    ? orgName
    : checkIfResourceTypeTeam
      ? teamInfo?.name
      : user?.name ||
        convertEmailUsernameToName(getUserNameFromEmail(user?.email || resourceAudienceType)) ||
        'Unknown';
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
    const roleValue = selectedOption.value.toString();

    await changeRole(
      resourceAudienceId,
      roleValue,
      roleValue !== PERMISSION_ROLES.ADMIN ? fgacFilters : null,
      false,
      user.type,
    )
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
    deleteAudience(resourceAudienceId, userName || '', resourceAudienceType)
      .then(() => {
        handleCloseRemoveFromTeamPopup();
      })
      .catch((err) => {
        handleCloseRemoveFromTeamPopup();
        toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_DELETED);
      });
  };

  const handleToggleCustomiseAccess = () => {
    if (showRoleChangeDropdown && role?.value !== PERMISSION_ROLES.ADMIN && showRoleChangeDropdown) {
      setShowCustomiseAccess((prev) => !prev);
    }
  };

  const handleSaveCustomiseAccess = async () => {
    await changeRole(resourceAudienceId, role?.value || '', convertToFilterModel(selectedFilters))
      .then(() => {
        handleToggleCustomiseAccess();
      })
      .catch((err) => {
        toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_CUSTOMISE_ACCESS);
      });
  };

  const tooltipText = checkIfUser
    ? ''
    : !currentUserHasAdminAccess
      ? ACCESS_MESSAGES_CUSTOMISE_ACCESS
      : role?.value === PERMISSION_ROLES.ADMIN
        ? ACCESS_MESSAGES_ADMIN_ROLE
        : '';

  useOnClickOutside(dropdownRef, handleCloseChangeRoleDropdown);

  return (
    <>
      <div className='f-12-400 flex items-center justify-between bg-white'>
        <div className='flex items-center justify-start'>
          <div className='flex w-[168px] items-start justify-start gap-x-1 px-2'>
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
                    className='f-8-400 flex h-4 w-4 items-center justify-center rounded-full text-white'
                  />
                </div>
              )}
              <div
                className={cn(
                  'flex items-center justify-center gap-1 whitespace-nowrap capitalize',
                  checkIfResourceTypeTeam && 'rounded px-1.5 py-0.5',
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
          <span className='hidden w-[100px] flex-wrap items-center justify-start gap-1 text-wrap break-words whitespace-normal'>
            {currentUserHasAdminAccess && (
              <>
                <Image src={JOINED_DATASET_ICON} alt='joined-dataset-icon' width={16} height={16} />
                {resourceType}
              </>
            )}
          </span>
        </div>
        {isCustomiseAccess && (
          <ShareResourceAccessDetails
            fgacFilters={fgacFilters ?? {}}
            showRoleChangeDropdown={showRoleChangeDropdown}
            handleToggleCustomiseAccess={handleToggleCustomiseAccess}
            fgacColor={fgacColor ?? ''}
            tooltipText={tooltipText}
            emptyFiltersTitle={emptyFiltersTitle}
          />
        )}

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
            parentWrapperClassName='w-[70px] justify-end'
          />
        ) : (
          <span
            className={cn(
              'f-12-400 text-GRAY_1000 flex w-[70px] items-center py-3 pl-4',
              !showRoleChangeDropdown && 'text-GRAY_600',
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
      {showCustomiseAccess && (
        <CustomiseAccess
          isOpen={showCustomiseAccess}
          onClose={handleToggleCustomiseAccess}
          datasetId={resourceId}
          resourceType={resourceType}
          fgacFilters={fgacFilters}
          onSave={handleSaveCustomiseAccess}
          isSaving={isChangingRole}
        />
      )}
    </>
  );
};

export default withFiltersContext(AudienceAccess);
