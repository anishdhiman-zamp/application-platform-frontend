'use client';

import { FC, useMemo, useRef, useState } from 'react';
import { Button, CSS_VARS, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { useOnClickOutside } from 'hooks';
import { useUserIdentity } from 'hooks/useUserIdentity';
import { motion } from 'motion/react';
import { defaultFn, OptionsType } from 'types/commonTypes';
import { cn, getUserNameFromEmail } from 'utils/common';
import { DatasetRoleValue, useGetDatasetRolesQuery, useManageDatasetRoleMutation } from '@/apis/agentManagedDb';
import { useGetAudiencesByOrganisationIdQuery } from '@/apis/people';
import AsyncDropdown from 'components/asyncDropdown/AsyncDropdown';
import Avatar from 'components/common/avatar';
import { Dropdown } from 'components/common/dropdown';
import { toast } from 'components/common/toast/Toast';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import CopyToClipboardBrowserUrl from 'components/CopyToClipboardBrowserUrl';
import WhoHasAccessSkeletonLoader from 'components/skeletons/WhoHasAccessSkeletonLoader';

const NEON_DATASET_ROLES: (OptionsType & { desc: string })[] = [
  { label: 'Admin', value: 'admin', desc: 'Can manage and share dataset' },
  { label: 'Viewer', value: 'viewer', desc: 'Can read data only' },
  { label: 'Editor', value: 'editor', desc: 'Can update existing data' },
];

type ShareDatasetNeonPopupProps = {
  tableName: string;
};

const ShareDatasetNeonPopup: FC<ShareDatasetNeonPopupProps> = ({ tableName }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserLabel, setSelectedUserLabel] = useState('');
  const [selectedRole, setSelectedRole] = useState<DatasetRoleValue>('viewer');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { userId, organizationId, isAdmin: isOrgAdmin } = useUserIdentity();
  const { data: orgMembers } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId || !open },
  );
  const { data: rolesData, isLoading: isLoadingRoles } = useGetDatasetRolesQuery({ tableName }, { skip: !open });
  const [manageRole, { isLoading: isManaging }] = useManageDatasetRoleMutation();

  const orgMemberMap = useMemo(() => {
    const map = new Map<string, { name: string; email: string }>();

    orgMembers?.forEach((m) => {
      map.set(m.user.user_id, { name: m.user.name, email: m.user.email });
    });

    return map;
  }, [orgMembers]);

  const existingUserIds = useMemo(() => new Set(rolesData?.roles?.map((r) => r.user_id) ?? []), [rolesData]);

  const filteredMembers = useMemo(() => {
    if (!orgMembers) return [];
    const lowerSearch = search.toLowerCase();

    return orgMembers.filter((m) => {
      if (existingUserIds.has(m.user.user_id)) return false;
      if (m.user.user_id === userId) return false;
      if (!search) return true;

      return m.user.name?.toLowerCase().includes(lowerSearch) || m.user.email?.toLowerCase().includes(lowerSearch);
    });
  }, [orgMembers, existingUserIds, userId, search]);

  const currentUserRole = useMemo(() => rolesData?.roles?.find((r) => r.user_id === userId)?.role, [rolesData, userId]);
  const canManageAccess = currentUserRole === 'admin' || isOrgAdmin;

  useOnClickOutside(searchRef, () => setShowDropdown(false));

  const handleClose = () => {
    setOpen(false);
    setSearch('');
    setSelectedUserId(null);
    setSelectedUserLabel('');
  };

  const handleToggle = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
    } else {
      handleClose();
    }
  };

  const handleSelectMember = (memberId: string, label: string) => {
    setSelectedUserId(memberId);
    setSelectedUserLabel(label);
    setSearch('');
    setShowDropdown(false);
  };

  const handleShare = async () => {
    if (!selectedUserId) return;
    try {
      await manageRole({
        table_name: tableName,
        user_id: selectedUserId,
        role: selectedRole,
        action: 'grant',
      }).unwrap();
      toast.success(`Shared dataset with ${selectedUserLabel}`);
      setSelectedUserId(null);
      setSelectedUserLabel('');
      setSearch('');
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };

      toast.error(apiErr?.data?.detail || 'Failed to share dataset');
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: OptionsType) => {
    try {
      await manageRole({
        table_name: tableName,
        user_id: targetUserId,
        role: newRole.value as DatasetRoleValue,
        action: 'grant',
      }).unwrap();
      toast.success('Role updated');
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };

      toast.error(apiErr?.data?.detail || 'Failed to update role');
    }
  };

  const handleRemoveAccess = async (targetUserId: string, userName: string) => {
    try {
      await manageRole({
        table_name: tableName,
        user_id: targetUserId,
        action: 'revoke',
      }).unwrap();
      toast.success(`Removed ${userName}`);
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };

      toast.error(apiErr?.data?.detail || 'Failed to remove access');
    }
  };

  return (
    <div className='flex w-fit'>
      <Popover open={open} onOpenChange={handleToggle}>
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
                  <div className='cursor-pointer p-1' onClick={handleClose}>
                    <SvgSpriteLoader
                      id='x-close'
                      iconCategory={ICON_SPRITE_TYPES.GENERAL}
                      width={16}
                      height={16}
                      className='text-GRAY_800 hover:text-GRAY_1000'
                    />
                  </div>
                </div>

                <div className='rounded-b-3.5 flex w-full flex-col'>
                  {canManageAccess && (
                    <div className='relative px-4 pb-3' ref={searchRef}>
                      <div className='border-GRAY_500 flex items-center gap-2 rounded-lg border px-3 py-2'>
                        {selectedUserId ? (
                          <div className='bg-GRAY_200 flex items-center gap-1 rounded px-2 py-0.5'>
                            <span className='f-12-500 text-GRAY_1000'>{selectedUserLabel}</span>
                            <SvgSpriteLoader
                              id='x-close'
                              iconCategory={ICON_SPRITE_TYPES.GENERAL}
                              width={12}
                              height={12}
                              className='text-GRAY_700 hover:text-GRAY_1000 cursor-pointer'
                              onClick={() => {
                                setSelectedUserId(null);
                                setSelectedUserLabel('');
                              }}
                            />
                          </div>
                        ) : (
                          <input
                            className='f-12-400 text-GRAY_1000 placeholder:text-GRAY_700 flex-1 border-none bg-transparent outline-none'
                            placeholder='Add people...'
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                          />
                        )}
                        <div className='flex h-fit min-w-max cursor-pointer'>
                          <Dropdown
                            options={NEON_DATASET_ROLES}
                            id='neon-dataset-role-picker'
                            eventCallback={defaultFn}
                            onChange={(opt) => {
                              if (opt) setSelectedRole(opt.value as DatasetRoleValue);
                            }}
                            value={NEON_DATASET_ROLES.find((r) => r.value === selectedRole)}
                            defaultValue={NEON_DATASET_ROLES[1]}
                            placeholder='Viewer'
                            isSearchable={false}
                            customClass={{
                              focus: 'none',
                              border: 'transparent',
                              fontSize: 'f-12-400',
                            }}
                            customClassNames={{
                              placeholder: 'f-12-400',
                              color: 'text-GRAY_900',
                            }}
                            menuOptionClasses={{
                              contentWrapper: 'py-2',
                            }}
                            customDropdownIndicatorSize={14}
                          />
                        </div>
                      </div>

                      {showDropdown && !selectedUserId && filteredMembers.length > 0 && (
                        <div className='border-GRAY_500 shadow-table-filter-menu bg-BG_WHITE absolute right-4 left-4 z-50 mt-1 max-h-[180px] overflow-y-auto rounded-lg border'>
                          {filteredMembers.map((m) => {
                            const name = m.user.name || getUserNameFromEmail(m.user.email);

                            return (
                              <div
                                key={m.user.user_id}
                                className='hover:bg-BG_GRAY_1 flex cursor-pointer items-center gap-2 px-3 py-2'
                                onClick={() => handleSelectMember(m.user.user_id, name)}
                              >
                                <Avatar
                                  name={name}
                                  backgroundColor={CSS_VARS.GRAY_1000}
                                  className='f-8-400 flex h-5 w-5 items-center justify-center rounded-full text-white dark:text-black'
                                />
                                <div className='flex flex-col'>
                                  <span className='f-12-500 text-GRAY_1000'>{name}</span>
                                  <span className='f-11-400 text-GRAY_700'>{m.user.email}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div className='border-t-0.5 border-GRAY_500 flex w-full items-center justify-between px-5 py-4'>
                    <span className='f-11-500 flex items-center justify-center gap-1.5'>
                      <SvgSpriteLoader
                        id='link-03'
                        iconCategory={ICON_SPRITE_TYPES.GENERAL}
                        width={12}
                        height={12}
                        color={CSS_VARS.GRAY_1000}
                      />
                      <CopyToClipboardBrowserUrl />
                    </span>
                    {canManageAccess && (
                      <Button size='small' disabled={!selectedUserId} onClick={handleShare} isLoading={isManaging}>
                        Share
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className='rounded-3.5 border-0.5 border-GRAY_500 shadow-table-filter-menu bg-BG_WHITE mt-2 pt-4 pb-2'>
                <span className='f-12-500 text-GRAY_700 px-4'>Who has access</span>
                <motion.div
                  initial={{ opacity: 0, overflow: 'hidden' }}
                  animate={open ? { opacity: 1, height: 'auto', overflow: 'auto' } : { opacity: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], opacity: { duration: 0.15 } }}
                  className='mt-2 flex max-h-[222px] w-full flex-col overflow-y-auto px-2 [&::-webkit-scrollbar]:hidden'
                >
                  <CommonWrapper
                    skeletonType={SkeletonTypes.CUSTOM}
                    isLoading={isLoadingRoles}
                    loader={<WhoHasAccessSkeletonLoader />}
                  >
                    {rolesData?.roles?.map((entry) => {
                      const memberInfo = orgMemberMap.get(entry.user_id);
                      const displayName =
                        memberInfo?.name || getUserNameFromEmail(memberInfo?.email ?? '') || entry.user_id;
                      const isCurrentUser = entry.user_id === userId;
                      const currentRole = NEON_DATASET_ROLES.find((r) => r.value === entry.role);
                      const showManage = canManageAccess && !isCurrentUser;

                      return (
                        <NeonAudienceRow
                          key={entry.user_id}
                          displayName={displayName}
                          isCurrentUser={isCurrentUser}
                          currentRole={currentRole}
                          canManage={showManage}
                          onRoleChange={(role) => handleRoleChange(entry.user_id, role)}
                          onRemove={() => handleRemoveAccess(entry.user_id, displayName)}
                        />
                      );
                    })}
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

type NeonAudienceRowProps = {
  displayName: string;
  isCurrentUser: boolean;
  currentRole?: OptionsType & { desc: string };
  canManage: boolean;
  onRoleChange: (role: OptionsType) => void;
  onRemove: () => void;
};

const NeonAudienceRow: FC<NeonAudienceRowProps> = ({
  displayName,
  isCurrentUser,
  currentRole,
  canManage,
  onRoleChange,
  onRemove,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className='f-12-400 bg-BG_WHITE flex items-center justify-between'>
      <div className='flex w-[168px] items-center gap-1 px-2'>
        <Avatar
          name={displayName}
          backgroundColor={CSS_VARS.GRAY_1000}
          className='f-8-400 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white dark:text-black'
        />
        <span className='whitespace-nowrap capitalize'>
          {displayName}
          {isCurrentUser && <span className='f-12-400 text-GRAY_700'> (You)</span>}
        </span>
      </div>
      {canManage ? (
        <AsyncDropdown
          onOpen={() => setDropdownOpen(true)}
          onClose={() => setDropdownOpen(false)}
          isOpen={dropdownOpen}
          onDelete={onRemove}
          onChange={onRoleChange}
          options={NEON_DATASET_ROLES}
          selectedValue={currentRole ?? NEON_DATASET_ROLES[1]}
          defaultValue={currentRole ?? NEON_DATASET_ROLES[1]}
          showDelete
          showSelectedIcon
          isHoveredDropdown={isHovered}
          setIsHoveredDropdown={setIsHovered}
          isOverflowStyle
          parentWrapperClassName='w-[70px] justify-end'
        />
      ) : (
        <span className={cn('f-12-400 text-GRAY_600 flex w-[70px] items-center py-3 pl-4')}>
          {currentRole?.label ?? 'Viewer'}
        </span>
      )}
    </div>
  );
};

export default ShareDatasetNeonPopup;
