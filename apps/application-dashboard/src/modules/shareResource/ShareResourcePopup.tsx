import { FC, useMemo, useState } from 'react';
import {
  Button,
  CSS_VARS,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogHeaderTitle,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  ScrollContainer,
} from '@zamp-platform/ui';
import {
  useDeleteAudienceFromResourceMutation,
  usePatchChangeAudienceRoleInResourceMutation,
  usePostShareResourceToAudiencesMutation,
} from 'apis/collaboration';
import { useAppSelector } from 'hooks/toolkit';
import { useUserIdentity } from 'hooks/useUserIdentity';
import { Link, X } from 'lucide-react';
import AccessFilters from 'modules/shareResource/AccessFilters';
import AudienceAccess from 'modules/shareResource/AudienceAccess';
import { RESOURCE_COLLABORATION_ENDPOINTS, resourceTypeRouteMap } from 'modules/shareResource/shareResource.constants';
import { motion } from 'motion/react';
import { RootState } from 'store';
import { ResourceAudienceType } from 'types/api/auth.types';
import { VALIDATION_ERROR_MESSAGES } from 'utils/accessPermission/accessPermission.constants';
import { getCustomFilterColor, getUserNameFromEmail, validateEmail } from 'utils/common';
import { useGetAudiencesByOrganisationIdQuery } from '@/apis/people';
import { useTheme } from '@/app/_providers/theme-provider';
import { convertToFilterModel } from '@/components/common/table/table.utils';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from '@/components/filter/filters.context';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { THEME_MODE } from '@/modules/general/constants/general.constants';
import CustomiseAccess from '@/modules/shareResource/CustomiseAccess';
import {
  AGENT_ACCESS_PRIVILEGES,
  APP_ACCESS_PRIVILEGES,
  CombinedOptionListDataType,
  CONNECTION_ACCESS_PRIVILEGES,
  CREDENTIAL_ACCESS_PRIVILEGES,
  DATASET_ACCESS_PRIVILEGES,
  PAGE_ACCESS_PRIVILEGES,
  PAYMENT_ACCESS_PRIVILEGES,
  PROCESS_ACCESS_PRIVILEGES,
  ResourceType,
  ShareResourcePopupProps,
  ShareResourceVersion,
  ValidationResult,
} from '@/modules/shareResource/shareResource.types';
import { resolveChipColor } from '@/modules/team/people.utils';
import { AddAudiencesToResourcePayload } from '@/types/api/collaboration.types';
import { FilterModelType } from '@/types/components/table.type';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';
import { toast } from 'components/common/toast/Toast';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import CopyToClipboardBrowserUrl from 'components/CopyToClipboardBrowserUrl';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import WhoHasAccessSkeletonLoader from 'components/skeletons/WhoHasAccessSkeletonLoader';

const WhoHasAccessLoaderVariants = {
  hidden: {
    opacity: 0,
    overflow: 'hidden',
  },
  visible: {
    opacity: 1,
    height: 'auto',
    overflow: 'auto',
  },
};

const ShareResourcePopup: FC<ShareResourcePopupProps> = (props) => {
  const {
    resourceType,
    resourceConfig,
    isCustomiseAccess = false,
    title,
    disable,
    version,
    additionalOptions,
    forceAdminAccess = false,
    customTrigger,
    renderInDialog = false,
  } = props;
  const resourceId = props.resourceId || '';
  const [selectedRole, setSelectedRole] = useState<string>(resourceConfig.accessPrivilegesList[0]?.value ?? '');
  const [search, setSearch] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [validationErrorText, setValidationErrorText] = useState<string>('');
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [showCustomiseAccess, setShowCustomiseAccess] = useState<boolean>(false);
  const collaborationEndpoints = RESOURCE_COLLABORATION_ENDPOINTS[version ?? ShareResourceVersion.V1];
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === THEME_MODE.DARK;

  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';

  const { audiencesData, checkUserPrivilege, allTeamsData, isLoadingAudiencesData, refetchAudiencesData } =
    useResourceAccess({ resourceType, resourceId, skipAudienceData: !openPopup, skipTeamsData: !openPopup, version });

  const {
    state: { selectedFilters },
    dispatch,
  } = useFiltersContextStore();

  // get teams and users data in the organization
  const { data: teamMembersData } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !organizationId || !openPopup },
  );

  // post invite audiences
  const [postInviteAudiences, { isLoading: postInviteAudiencesIsLoading }] = usePostShareResourceToAudiencesMutation();

  // patch audience role
  const [changeRole, { isLoading: isChangingRole }] = usePatchChangeAudienceRoleInResourceMutation();

  // delete audience
  const [deleteAudience, { isLoading: isDeletingAudience }] = useDeleteAudienceFromResourceMutation();

  // get user access to resource list
  const userAccessToResourceList = useMemo(() => audiencesData ?? [], [audiencesData]);
  const placeholderText = 'Share with people and teams';
  const { userEmail: user_email, userId: user_id, userRole: user_role } = useUserIdentity();
  const userPrivilege =
    (audiencesData || [])?.find((audience) => audience?.user?.email === user_email)?.privilege ?? user_role ?? '';
  const currentUserHasAdminAccess = useMemo(() => {
    if (forceAdminAccess) return true;

    switch (resourceType) {
      case ResourceType.DATASET:
        return checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN);
      case ResourceType.PAGE:
        return checkUserPrivilege(PAGE_ACCESS_PRIVILEGES.ADMIN);
      case ResourceType.PAYMENTS:
        return checkUserPrivilege(PAYMENT_ACCESS_PRIVILEGES.ADMIN);
      case ResourceType.PROCESS:
        return checkUserPrivilege(PROCESS_ACCESS_PRIVILEGES.ADMIN);
      case ResourceType.CONNECTION:
        return checkUserPrivilege(CONNECTION_ACCESS_PRIVILEGES.ADMIN);
      case ResourceType.APP:
        return checkUserPrivilege(APP_ACCESS_PRIVILEGES.ADMIN);
      case ResourceType.AGENT:
        return checkUserPrivilege(AGENT_ACCESS_PRIVILEGES.ADMIN) || checkUserPrivilege(AGENT_ACCESS_PRIVILEGES.OWNER);
      case ResourceType.CREDENTIAL:
        return checkUserPrivilege(CREDENTIAL_ACCESS_PRIVILEGES.ADMIN);
      default:
        return false;
    }
  }, [forceAdminAccess, checkUserPrivilege, resourceType]);

  const isResourceSharable = !showValidationError && selectedItems?.length > 0 && currentUserHasAdminAccess;
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name);
  const orgLabel = `Everyone in ${orgName}`;

  const audienceFgacColorMap = useMemo(() => {
    const fgacColorMap: Record<string, string> = {};

    userAccessToResourceList?.forEach((audience) => {
      if (audience?.metadata?.fgac_filters) {
        const fgacString = JSON.stringify(audience?.metadata?.fgac_filters);

        if (!fgacColorMap[fgacString]) {
          fgacColorMap[fgacString] = getCustomFilterColor();
        }
      }
    });

    return fgacColorMap;
  }, [userAccessToResourceList]);

  const updatedUserAccessList = useMemo(
    () =>
      userAccessToResourceList
        ?.map((audience) => {
          const matchingTeam = allTeamsData?.find((team) => team?.team_id === audience?.resource_audience_id);

          // Enrich agent entries with agent name from additionalOptions
          let enrichedUser = audience?.user;
          const matchingAgent = additionalOptions?.find((opt) => opt?.value === audience?.resource_audience_id);

          if (matchingAgent) {
            enrichedUser = {
              ...(audience?.user ?? {}),
              name: matchingAgent?.label,
              email: audience?.user?.email ?? '',
              user_id: audience?.resource_audience_id,
            };
          }

          return {
            ...audience,
            user: enrichedUser,
            team_name: matchingTeam?.name ?? '',
            team_color: matchingTeam?.metadata?.color_hex_code ?? '',
            fgac_color: audienceFgacColorMap[JSON.stringify(audience?.metadata?.fgac_filters)] ?? '',
          };
        })
        .filter(
          (item, index, self) =>
            !(item.resource_audience_type === ResourceAudienceType.AGENT && !item.user) &&
            index ===
              self.findIndex(
                (t) =>
                  t.resource_audience_type === item.resource_audience_type &&
                  t.resource_audience_id === item.resource_audience_id,
              ),
        ),
    [userAccessToResourceList, allTeamsData, audienceFgacColorMap, additionalOptions],
  );

  const emptyFiltersTitle = useMemo(() => {
    switch (resourceType) {
      case ResourceType.PAYMENTS:
        return 'All Accounts';
      default:
        return 'All Data';
    }
  }, [resourceType]);

  const handleClosePopup = () => {
    if (showCustomiseAccess) return;
    setOpenPopup(false);
    setShowValidationError(false);
    setSelectedItems([]);
    setSearch('');
  };

  const handleTogglePopup = (open: boolean) => {
    if (open && organizationId) {
      setOpenPopup(true);
      refetchAudiencesData();
    } else {
      handleClosePopup();
    }
  };

  const handleShareResource = () => {
    const shareData: AddAudiencesToResourcePayload = {
      audiences: selectedItems?.map((item) => ({
        audience_type:
          item?.resource_audience_type === ResourceAudienceType.AGENT ? 'user' : (item?.resource_audience_type ?? ''),
        audience_id: (item?.resource_audience_id || item?.team_id) ?? '',
        role: (selectedRole as string) ?? item?.role,
        fgac_filters: convertToFilterModel(selectedFilters),
      })),
    };

    postInviteAudiences({
      apiEndpoint: collaborationEndpoints.shareResource,
      resourceRoute: resourceTypeRouteMap[resourceType],
      resourceId,
      body: shareData,
    })
      .unwrap()
      .then(() => {
        setSelectedItems([]);
        refetchAudiencesData();
        toast.success(resourceConfig.toastMessages.success);
      })
      .catch((err) => {
        toast.error(err?.data?.error || resourceConfig.toastMessages.failed);
      });
  };

  const handleRoleChange = async (
    resourceAudienceId: string,
    role: string,
    fgacFilters?: FilterModelType,
    isRoleChange?: boolean,
    audienceType?: string,
  ): Promise<boolean> => {
    const success = await changeRole({
      apiEndpoint: collaborationEndpoints.changeRole,
      resourceRoute: resourceTypeRouteMap[resourceType],
      resourceId,
      body: {
        audience_id: resourceAudienceId,
        role,
        fgac_filters: fgacFilters,
        audience_type: audienceType ?? '',
      },
    })
      .unwrap()
      .then(() => {
        refetchAudiencesData();
        toast.success(TOAST_MESSAGES.SUCCESS_AUDIENCE_ROLE_CHANGED);

        return true;
      })
      .catch((err) => {
        toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_ROLE_CHANGED);

        return false;
      });

    return success;
  };

  const handleDeleteAudience = async (
    resourceAudienceId: string,
    userName: string,
    audience_type: ResourceAudienceType,
  ) => {
    await deleteAudience({
      apiEndpoint: collaborationEndpoints.deleteAudience,
      resourceRoute: resourceTypeRouteMap[resourceType],
      resourceId,
      body: {
        audience_id: resourceAudienceId,
        audience_type,
      },
    })
      .unwrap()
      .then(() => {
        refetchAudiencesData();
        toast.success(`Removed ${userName} successfully`);
      })
      .catch((err) => {
        toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_DELETED);
      });
  };

  const validateAndGetUserDetails = (value: string, type?: string): ValidationResult => {
    const isValid = validateEmail(value);
    let resource_audience_id = '';
    let resource_audience_type = '';

    if (type === ResourceAudienceType.TEAM) {
      return { isValid: true, resource_audience_type: ResourceAudienceType.TEAM };
    }

    if (type === ResourceAudienceType.AGENT) {
      return { isValid: true, resource_audience_type: ResourceAudienceType.AGENT, resource_audience_id: value };
    }

    const isOrgAlreadyInvited = userAccessToResourceList?.some(
      (item) => item?.resource_audience_type === ResourceAudienceType.ORGANIZATION,
    );

    if (isOrgAlreadyInvited && value === orgName) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.ORG_ALREADY_HAS_ACCESS };
    } else if (value === orgName) {
      return {
        isValid: true,
        resource_audience_type: ResourceAudienceType.ORGANIZATION,
        resource_audience_id: organizationId,
      };
    }

    if (!isValid) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.INVALID_EMAIL };
    }

    const audience = teamMembersData?.find((audience) => audience?.user?.email === value);

    if (!audience) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.USER_NOT_IN_ORG };
    }

    const isAlreadyInvited = userAccessToResourceList?.some((item) => item?.user?.email === value);

    if (isAlreadyInvited) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.USER_ALREADY_HAS_ACCESS };
    }

    if (isOrgAlreadyInvited && value === orgName) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.ORG_ALREADY_HAS_ACCESS };
    }

    if (value === user_email) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.CANNOT_ADD_SELF };
    }

    resource_audience_type = audience?.resource_audience_type ?? '';
    resource_audience_id = audience?.resource_audience_id ?? '';

    return { isValid: true, resource_audience_type, resource_audience_id };
  };

  const handleValidateAndAdd = ({ value, label, type, color, team_id }: CombinedOptionListDataType) => {
    const { isValid, message, resource_audience_type, resource_audience_id } = validateAndGetUserDetails(value, type);

    setSelectedItems((prev) => {
      const updatedItems = [
        ...prev,
        {
          value,
          label,
          valid: isValid,
          role: selectedRole as string,
          color: isValid ? (color ? color : CSS_VARS.BG_WHITE) : CSS_VARS.RED_100,
          team_id,
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
    const { isValid, message, resource_audience_type, resource_audience_id } = validateAndGetUserDetails(
      option?.value,
      option?.type,
    );

    setSelectedItems((prev) => {
      const updatedItems = [
        ...prev,
        {
          value: option?.value,
          label: option?.label,
          valid: isValid,
          color: isValid ? (option?.color ? option?.color : CSS_VARS.BG_WHITE) : CSS_VARS.RED_100,
          role: selectedRole as string,
          team_id: option?.team_id,
          resource_audience_type,
          resource_audience_id,
        },
      ];

      setShowValidationError(updatedItems?.some((item) => !item?.valid));

      return updatedItems;
    });

    if (!isValid) {
      setValidationErrorText(message ?? '');
    }
  };

  const combinedOptionListsData: CombinedOptionListDataType[] = [
    { label: orgLabel ?? '', value: orgName ?? '', type: ResourceAudienceType.ORGANIZATION, color: '' },
    ...(teamMembersData
      ?.filter((member) => member?.resource_audience_type !== ResourceAudienceType.AGENT)
      .map((member) => ({
        label: member?.user?.name || getUserNameFromEmail(member?.user?.email ?? '') || '',
        value: member?.user?.email ?? '',
        type: member?.resource_audience_type ?? '',
      })) || []),
    ...(allTeamsData?.map((item) => ({
      label: item?.name ?? '',
      value: item?.name ?? '',
      type: ResourceAudienceType.TEAM,
      color: resolveChipColor(item?.metadata?.color_hex_code, isDark),
      team_id: item?.team_id,
    })) || []),
    ...(additionalOptions ?? []),
  ];

  const filteredOptionListsData = [
    ...(combinedOptionListsData
      ?.filter(
        (item) =>
          !selectedItems?.some((selected) => selected?.value === item?.value) &&
          !audiencesData?.some(
            (audience) => audience?.user?.email === item?.value || audience?.resource_audience_id === item?.value,
          ) &&
          !updatedUserAccessList?.some((team) => team?.resource_audience_id === item?.team_id),
      )
      .map((member) => ({
        label: member?.label ?? '',
        value: member?.value ?? '',
        type: member?.type ?? '',
        color: member?.color ?? '',
        team_id: member?.team_id ?? '',
      })) || []),
  ];

  const handleToggleCustomiseAccess = () => {
    setShowCustomiseAccess((prev) => !prev);
  };

  const handleSelectedRoleChange = (role: string) => {
    setSelectedRole(role);
    if (role === PERMISSION_ROLES.ADMIN) {
      dispatch({
        type: filtersContextActions.RESET_ALL_FILTERS,
      });
    }
  };

  const shareForm = (
    <div className='space-y-4 px-4 pt-0 pb-5'>
      <MultiSelectInput
        id={`share-${resourceType.toLowerCase()}`}
        search={search}
        setSearch={setSearch}
        selectedRole={selectedRole as string}
        setSelectedRole={handleSelectedRoleChange}
        isOpen={openPopup}
        placeholderText={placeholderText}
        roleOptions={resourceConfig.accessPrivilegesList}
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
      {isCustomiseAccess && (
        <AccessFilters
          onClick={handleToggleCustomiseAccess}
          currentUserHasAdminAccess={currentUserHasAdminAccess}
          selectedRole={selectedRole as string}
          emptyFiltersTitle={emptyFiltersTitle}
        />
      )}
    </div>
  );

  const shareActions = (
    <div className='border-t-0.5 border-GRAY_500 flex w-full items-center justify-between px-5 py-4'>
      <span className='f-11-500 flex cursor-not-allowed items-center justify-center gap-1.5'>
        <Link size={12} className='text-GRAY_1000' />
        <CopyToClipboardBrowserUrl />
      </span>
      <Button
        id='send-user-invite-btn'
        size='small'
        disabled={!isResourceSharable}
        onClick={handleShareResource}
        isLoading={postInviteAudiencesIsLoading}
      >
        Share
      </Button>
    </div>
  );

  const renderWhoHasAccess = ({ className }: { className: string }) => (
    <motion.div
      initial={WhoHasAccessLoaderVariants.hidden}
      animate={openPopup ? WhoHasAccessLoaderVariants.visible : WhoHasAccessLoaderVariants.hidden}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.15 },
      }}
      className={className}
    >
      <CommonWrapper
        skeletonType={SkeletonTypes.CUSTOM}
        isLoading={isLoadingAudiencesData}
        loader={<WhoHasAccessSkeletonLoader />}
      >
        {updatedUserAccessList?.map((audience) => (
          <AudienceAccess
            key={audience?.resource_audience_id}
            resourceType={resourceType}
            privilege={audience?.privilege}
            resourceAudienceId={audience?.resource_audience_id}
            user={{
              ...audience?.user,
              email: audience?.user?.email ?? '',
              type: audience?.resource_audience_type,
              name: [audience?.user?.name, audience?.user?.last_name].filter(Boolean).join(' '),
            }}
            resourceAudienceType={audience?.resource_audience_type}
            userPrivilege={userPrivilege}
            orgName={orgLabel}
            currentUserHasAdminAccess={currentUserHasAdminAccess}
            customerName={orgName ?? ''}
            teamInfo={{ name: audience?.team_name, color: audience?.team_color }}
            changeRole={handleRoleChange}
            deleteAudience={handleDeleteAudience}
            privilegeList={resourceConfig.accessPrivilegesList}
            isDeletingAudience={isDeletingAudience}
            isChangingRole={isChangingRole}
            currentUserId={user_id}
            isCustomiseAccess={isCustomiseAccess}
            fgacFilters={audience?.metadata?.fgac_filters}
            resourceId={resourceId}
            fgacColor={audience?.fgac_color}
            emptyFiltersTitle={emptyFiltersTitle}
          />
        ))}
      </CommonWrapper>
    </motion.div>
  );

  const triggerButton = customTrigger ?? (
    <Button
      size='small'
      variant='secondary'
      id={`share-${resourceType.toLowerCase()}-to-audience-btn`}
      disabled={disable}
    >
      Share
    </Button>
  );

  const titleText = title || `Share this ${resourceConfig?.displayName}`;

  if (renderInDialog) {
    return (
      <div className='flex w-fit'>
        <Dialog open={openPopup} onOpenChange={handleTogglePopup}>
          <DialogTrigger asChild>{triggerButton}</DialogTrigger>
          <DialogContent size='small' showCloseButton className='max-h-[80vh] w-[522px] rounded-xl'>
            <DialogHeader className='border-none p-5'>
              <DialogHeaderTitle className='f-16-600 text-GRAY_950'>{titleText}</DialogHeaderTitle>
            </DialogHeader>
            <DialogBody className='flex min-h-0 flex-col gap-2.5 overflow-hidden pt-0 pb-0'>
              {shareForm}
              <div className='border-t-0.5 border-GRAY_500 flex max-h-[300px] min-h-0 w-full flex-col pt-4'>
                <span className='f-12-500 text-GRAY_700 px-5'>Who has access</span>
                <ScrollContainer fadeColor='var(--BG_WHITE)' fadeHeight='h-4' scrollbarStyle='thin'>
                  {renderWhoHasAccess({ className: 'flex w-full flex-col px-3 pt-2 pb-2' })}
                </ScrollContainer>
              </div>
              {shareActions}
            </DialogBody>
          </DialogContent>
        </Dialog>
        {showCustomiseAccess && (
          <CustomiseAccess
            isOpen={showCustomiseAccess}
            onClose={handleToggleCustomiseAccess}
            datasetId={resourceId}
            resourceType={resourceType}
            onSave={handleToggleCustomiseAccess}
          />
        )}
      </div>
    );
  }

  return (
    <div className='flex w-fit'>
      <Popover open={openPopup} onOpenChange={handleTogglePopup}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            align='end'
            side='bottom'
            sideOffset={4}
            avoidCollisions={false}
            className='w-[420px] border-none bg-transparent p-0 shadow-none'
          >
            <div>
              <div className='border-0.5 border-GRAY_500 rounded-3.5 shadow-table-filter-menu bg-BG_WHITE'>
                <div className='flex w-full items-center justify-between p-5'>
                  <span className='f-16-600 text-GRAY_950'>{titleText}</span>
                  <button
                    type='button'
                    aria-label='Close'
                    className='text-GRAY_800 hover:text-GRAY_1000 cursor-pointer p-1'
                    onClick={handleClosePopup}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
                <div className='rounded-b-3.5 flex w-full flex-col'>
                  {shareForm}
                  {shareActions}
                </div>
              </div>
              <div className='rounded-3.5 border-0.5 border-GRAY_500 shadow-table-filter-menu bg-BG_WHITE mt-2 pt-4 pb-2'>
                <span className='f-12-500 text-GRAY_700 px-4'>Who has access</span>
                {renderWhoHasAccess({
                  className:
                    'mt-2 flex max-h-[222px] w-full flex-col overflow-y-auto px-2 [&::-webkit-scrollbar]:hidden',
                })}
              </div>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
      {showCustomiseAccess && (
        <CustomiseAccess
          isOpen={showCustomiseAccess}
          onClose={handleToggleCustomiseAccess}
          datasetId={resourceId}
          resourceType={resourceType}
          onSave={handleToggleCustomiseAccess}
        />
      )}
    </div>
  );
};

export default withFiltersContext(ShareResourcePopup);
