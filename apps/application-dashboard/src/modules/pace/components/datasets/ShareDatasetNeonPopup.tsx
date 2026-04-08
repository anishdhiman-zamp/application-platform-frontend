'use client';

import { FC, useMemo, useState } from 'react';
import { Button, CSS_VARS, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@zamp-platform/ui';
import { useUserIdentity } from 'hooks/useUserIdentity';
import { LinkIcon, XIcon } from 'lucide-react';
import { NEON_DATASET_ROLES } from 'modules/pace/components/datasets/datasets.constants';
import AudienceAccess from 'modules/shareResource/AudienceAccess';
import { motion } from 'motion/react';
import { ResourceAudienceType } from 'types/api/auth.types';
import { VALIDATION_ERROR_MESSAGES } from 'utils/accessPermission/accessPermission.constants';
import { getUserNameFromEmail } from 'utils/common';
import {
  DatasetRoleValue,
  RoleAction,
  useGetDatasetRolesQuery,
  useManageDatasetRoleMutation,
} from '@/apis/agentManagedDb';
import { useGetAudiencesByOrganisationIdQuery } from '@/apis/people';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { CombinedOptionListDataType, ResourceType } from '@/modules/shareResource/shareResource.types';
import { toast } from 'components/common/toast/Toast';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import CopyToClipboardBrowserUrl from 'components/CopyToClipboardBrowserUrl';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import WhoHasAccessSkeletonLoader from 'components/skeletons/WhoHasAccessSkeletonLoader';

const WhoHasAccessLoaderVariants = {
  hidden: { opacity: 0, overflow: 'hidden' as const },
  visible: { opacity: 1, height: 'auto' as const, overflow: 'auto' as const },
};

type ShareDatasetNeonPopupProps = {
  tableName: string;
};

const ShareDatasetNeonPopup: FC<ShareDatasetNeonPopupProps> = ({ tableName }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>(NEON_DATASET_ROLES[0]?.value ?? 'admin');
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationErrorText, setValidationErrorText] = useState('');

  const { userId, userEmail, organizationId } = useUserIdentity();
  const { data: orgMembers } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId || !open },
  );
  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    refetch: refetchRoles,
  } = useGetDatasetRolesQuery({ tableName }, { skip: !open });
  const [manageRole, { isLoading: isManaging, isLoading: isChangingRole }] = useManageDatasetRoleMutation();

  const orgMemberMap = useMemo(() => {
    const map = new Map<string, { name: string; email: string }>();

    orgMembers?.forEach((m) => {
      if (m?.user?.user_id) {
        map.set(m.user.user_id, { name: m.user.name ?? '', email: m.user.email ?? '' });
      }
    });

    return map;
  }, [orgMembers]);

  const existingUserIds = useMemo(() => new Set(rolesData?.roles?.map((r) => r.user_id) ?? []), [rolesData]);

  const currentUserRole = useMemo(() => rolesData?.roles?.find((r) => r.user_id === userId)?.role, [rolesData, userId]);
  const canManageAccess = currentUserRole === DatasetRoleValue.ADMIN;
  const isResourceSharable = !showValidationError && selectedItems.length > 0 && canManageAccess;

  const audienceAccessList = useMemo(
    () =>
      (rolesData?.roles ?? []).map((entry) => {
        const memberInfo = orgMemberMap.get(entry.user_id);

        return {
          resource_audience_id: entry.user_id,
          resource_audience_type: ResourceAudienceType.USER as string,
          privilege: entry.role,
          user: {
            name: memberInfo?.name || getUserNameFromEmail(memberInfo?.email ?? '') || entry.user_id,
            email: memberInfo?.email ?? '',
            type: ResourceAudienceType.USER as string,
          },
          metadata: {},
        };
      }),
    [rolesData, orgMemberMap],
  );

  const combinedOptionListsData: CombinedOptionListDataType[] = useMemo(
    () =>
      (orgMembers ?? [])
        .filter((member) => member?.user != null)
        .map((member) => ({
          label: member.user?.name || getUserNameFromEmail(member.user?.email ?? '') || '',
          value: member.user?.email ?? '',
          type: member.resource_audience_type ?? '',
        })),
    [orgMembers],
  );

  const filteredOptionListsData = useMemo(
    () =>
      combinedOptionListsData.filter(
        (item) =>
          !selectedItems.some((selected) => selected?.value === item?.value) &&
          !audienceAccessList.some((a) => a?.user?.email === item?.value),
      ),
    [combinedOptionListsData, selectedItems, audienceAccessList],
  );

  const handleClosePopup = () => {
    setOpen(false);
    setSelectedItems([]);
    setSearch('');
    setShowValidationError(false);
  };

  const handleTogglePopup = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
    } else {
      handleClosePopup();
    }
  };

  const validateAndGetUserDetails = (value: string) => {
    const member = orgMembers?.find((m) => m.user.email === value);

    if (!member) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.USER_NOT_IN_ORG };
    }

    const isAlreadyShared = existingUserIds.has(member.user.user_id);

    if (isAlreadyShared) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.USER_ALREADY_HAS_ACCESS };
    }

    if (member.user.email === userEmail) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.CANNOT_ADD_SELF };
    }

    return {
      isValid: true,
      resource_audience_type: ResourceAudienceType.USER,
      resource_audience_id: member.user.user_id,
    };
  };

  const handleValidateAndAdd = ({ value, label }: CombinedOptionListDataType) => {
    const { isValid, message, resource_audience_type, resource_audience_id } = validateAndGetUserDetails(value);

    setSelectedItems((prev) => {
      const updatedItems = [
        ...prev,
        {
          value,
          label,
          valid: isValid,
          role: selectedRole,
          color: isValid ? CSS_VARS.BG_WHITE : CSS_VARS.RED_100,
          resource_audience_type,
          resource_audience_id,
        },
      ];

      setShowValidationError(updatedItems.some((item) => !item.valid));

      return updatedItems;
    });
    if (!isValid) {
      setValidationErrorText(message ?? '');
    }
  };

  const handleOptionSelection = (option: CombinedOptionListDataType) => {
    handleValidateAndAdd(option);
  };

  const handleShareResource = async () => {
    try {
      for (const item of selectedItems) {
        if (!item.valid || !item.resource_audience_id) continue;
        await manageRole({
          table_name: tableName,
          user_id: item.resource_audience_id,
          role: selectedRole as DatasetRoleValue,
          action: RoleAction.GRANT,
        }).unwrap();
      }
      setSelectedItems([]);
      refetchRoles();
      toast.success('Dataset shared successfully');
      handleClosePopup();
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };

      toast.error(apiErr?.data?.detail || 'Failed to share dataset');
    }
  };

  const handleRoleChange = async (resourceAudienceId: string, role: string): Promise<boolean> => {
    try {
      await manageRole({
        table_name: tableName,
        user_id: resourceAudienceId,
        role: role as DatasetRoleValue,
        action: RoleAction.GRANT,
      }).unwrap();
      refetchRoles();
      toast.success(TOAST_MESSAGES.SUCCESS_AUDIENCE_ROLE_CHANGED);

      return true;
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };

      toast.error(apiErr?.data?.detail || TOAST_MESSAGES.FAILED_AUDIENCE_ROLE_CHANGED);

      return false;
    }
  };

  const handleDeleteAudience = async (resourceAudienceId: string, userName: string) => {
    try {
      await manageRole({
        table_name: tableName,
        user_id: resourceAudienceId,
        action: RoleAction.REVOKE,
      }).unwrap();
      refetchRoles();
      toast.success(`Removed ${userName} successfully`);
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };

      toast.error(apiErr?.data?.detail || TOAST_MESSAGES.FAILED_AUDIENCE_DELETED);
    }
  };

  return (
    <div className='flex w-fit'>
      <Popover open={open} onOpenChange={handleTogglePopup}>
        <PopoverTrigger asChild>
          <Button size='small' variant='secondary'>
            Share
          </Button>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent align='end' className='w-[420px] border-none bg-transparent p-0 shadow-none'>
            <div>
              <div className='border-0.5 border-GRAY_500 rounded-3.5 shadow-table-filter-menu bg-BG_WHITE'>
                <div className='flex w-full items-center justify-between p-5'>
                  <span className='f-16-600 text-GRAY_950'>Share this dataset</span>
                  <div className='cursor-pointer p-1' onClick={handleClosePopup}>
                    <XIcon size={16} className='text-GRAY_800 hover:text-GRAY_1000' />
                  </div>
                </div>
                <div className='rounded-b-3.5 flex w-full flex-col'>
                  {canManageAccess && (
                    <div className='space-y-4 px-4 pt-0 pb-5'>
                      <MultiSelectInput
                        id='share-neon-dataset'
                        search={search}
                        setSearch={setSearch}
                        selectedRole={selectedRole}
                        setSelectedRole={setSelectedRole}
                        isOpen={open}
                        placeholderText='Share with people and teams'
                        roleOptions={NEON_DATASET_ROLES}
                        inputArrayList={selectedItems}
                        setInputArrayList={setSelectedItems}
                        validationErrorText={validationErrorText}
                        showValidationError={showValidationError}
                        setShowValidationError={setShowValidationError}
                        onValidateAndAdd={handleValidateAndAdd}
                        optionsList={filteredOptionListsData}
                        onSelectOption={handleOptionSelection}
                        transformLabel={getUserNameFromEmail}
                        optionalOpenDropdownOptions={false}
                        labelCasing='capitalize'
                        selectOnlyFromList
                      />
                    </div>
                  )}
                  <div className='border-t-0.5 border-GRAY_500 flex w-full items-center justify-between px-5 py-4'>
                    <span className='f-11-500 flex cursor-not-allowed items-center justify-center gap-1.5'>
                      <LinkIcon size={12} className='text-GRAY_1000' />
                      <CopyToClipboardBrowserUrl />
                    </span>
                    {canManageAccess && (
                      <Button
                        id='send-user-invite-btn'
                        size='small'
                        disabled={!isResourceSharable}
                        onClick={handleShareResource}
                        isLoading={isManaging}
                      >
                        Share
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className='rounded-3.5 border-0.5 border-GRAY_500 shadow-table-filter-menu bg-BG_WHITE mt-2 pt-4 pb-2'>
                <span className='f-12-500 text-GRAY_700 px-4'>Who has access</span>
                <motion.div
                  initial={WhoHasAccessLoaderVariants.hidden}
                  animate={open ? WhoHasAccessLoaderVariants.visible : WhoHasAccessLoaderVariants.hidden}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], opacity: { duration: 0.15 } }}
                  className='mt-2 flex max-h-[222px] w-full flex-col overflow-y-auto px-2 [&::-webkit-scrollbar]:hidden'
                >
                  <CommonWrapper
                    skeletonType={SkeletonTypes.CUSTOM}
                    isLoading={isLoadingRoles}
                    loader={<WhoHasAccessSkeletonLoader />}
                  >
                    {audienceAccessList.map((audience) => (
                      <AudienceAccess
                        key={audience.resource_audience_id}
                        resourceType={ResourceType.DATASET}
                        privilege={audience.privilege}
                        resourceAudienceId={audience.resource_audience_id}
                        user={audience.user}
                        resourceAudienceType={audience.resource_audience_type}
                        userPrivilege={currentUserRole ?? ''}
                        orgName=''
                        currentUserHasAdminAccess={canManageAccess}
                        customerName=''
                        teamInfo={{ name: '', color: '' }}
                        changeRole={handleRoleChange}
                        deleteAudience={handleDeleteAudience}
                        privilegeList={NEON_DATASET_ROLES}
                        isDeletingAudience={isManaging}
                        isChangingRole={isChangingRole}
                        currentUserId={userId}
                        emptyFiltersTitle='All Data'
                        resourceId={tableName}
                      />
                    ))}
                  </CommonWrapper>
                </motion.div>
              </div>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  );
};

export default ShareDatasetNeonPopup;
