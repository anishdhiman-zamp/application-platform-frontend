import { FC, useCallback, useRef, useState } from 'react';
import { useGetAudiencesByResourceIdQuery, usePostShareResourceToAudiencesMutation } from 'apis/collaboration';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { useAppSelector } from 'hooks/toolkit';
import { CombinedOptionListDataType } from 'modules/page/pages.types';
import { ShareResourcePopupProps, ValidationResult } from 'modules/shareResource/share-resource.types';
import { RootState } from 'store';
import { ResourceAudienceType } from 'types/api/auth.types';
import { AudiencesDatasetShareData } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { VALIDATION_ERROR_MESSAGES } from 'utils/accessPermission/accessPermission.constants';
import { PERMISSION_ROLES } from 'utils/accessPermission/accessPermission.types';
import { getUserEmail, getUserPrivilege } from 'utils/accessPermission/accessPermission.utils';
import { cn, getUserNameFromEmail, validateEmail } from 'utils/common';
import { useGetTeamsByOrganizationIdQuery } from '@/apis/people';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import CopyToClipboardBrowserUrl from 'components/CopyToClipboardBrowserUrl';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import WhoHasAccessSkeletonLoader from 'components/skeletons/WhoHasAccessSkeletonLoader';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const ShareResourcePopup: FC<ShareResourcePopupProps> = ({ resourceId, resourceType, resourceConfig }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [selectedRole, setSelectedRole] = useState<string | Record<number, string>>(
    resourceConfig.accessPrivilegesList[0].value,
  );
  const [search, setSearch] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [validationErrorText, setValidationErrorText] = useState<string>('');
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: teamMembersData } = useGetAudiencesByResourceIdQuery(
    { resourceType, resourceId },
    { skip: !resourceId },
  );

  const {
    data: audiencesData,
    isLoading: isLoadingAudiencesData,
    refetch: refetchAudiencesData,
  } = useGetAudiencesByResourceIdQuery({ resourceType, resourceId }, { skip: !resourceId });

  const [postInviteAudiences, { isLoading: postInviteAudiencesIsLoading }] = usePostShareResourceToAudiencesMutation();

  const userAccessToResourceList = audiencesData ?? [];
  const showInitialDropdownOptions = !isLoadingAudiencesData && !!(userAccessToResourceList?.length <= 1);
  const placeholderText = 'Share with people and teams';
  const user_email = getUserEmail();
  const user_role = getUserPrivilege();
  const userPrivilege =
    userAccessToResourceList?.find((audience) => audience?.user?.email === user_email)?.privilege ?? user_role ?? '';
  const isResourceSharable =
    !showValidationError && selectedItems?.length > 0 && userPrivilege === PERMISSION_ROLES.ADMIN;
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name);
  const orgLabel = `Everyone in ${orgName}`;
  const { data: allTeamsData } = useGetTeamsByOrganizationIdQuery({ organizationId }, { skip: !organizationId });

  const updatedUserAccessList = userAccessToResourceList?.map((audience) => {
    const matchingTeam = allTeamsData?.find((team) => team?.team_id === audience?.resource_audience_id);

    return {
      ...audience,
      team_name: matchingTeam?.name ?? '',
      team_color: matchingTeam?.metadata?.color_hex_code ?? '',
    };
  });

  const handleOpenPopup = () => {
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setShowValidationError(false);
    setSelectedItems([]);
    setSearch('');
  };

  const handleTogglePopup = useCallback(() => {
    if (openPopup) {
      handleClosePopup();
    } else {
      handleOpenPopup();
    }
  }, [openPopup]);

  useOnClickOutside(popupRef, handleClosePopup);

  const handleShareResource = () => {
    const shareData: AudiencesDatasetShareData = {
      audiences: selectedItems?.map((item) => ({
        audience_type: item?.resource_audience_type ?? '',
        audience_id: (item?.resource_audience_id || item?.team_id) ?? '',
        role: (selectedRole as string) ?? item?.role,
      })),
    };

    postInviteAudiences({ resourceType, resourceId, body: shareData })
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

  const validateAndGetUserDetails = (value: string, type?: string): ValidationResult => {
    const isValid = validateEmail(value);
    let resource_audience_id = '';
    let resource_audience_type = '';

    if (type === ResourceAudienceType.TEAM) {
      return { isValid: true, resource_audience_type: ResourceAudienceType.TEAM };
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
          color: isValid ? (color ? color : COLORS.WHITE) : COLORS.RED_100,
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
          color: isValid ? (option?.color ? option?.color : COLORS.WHITE) : COLORS.RED_100,
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
    ...(teamMembersData?.map((member) => ({
      label: getUserNameFromEmail(member?.user?.email ?? '') ?? '',
      value: member?.user?.email ?? '',
      type: member?.resource_audience_type ?? '',
    })) || []),
    ...(allTeamsData?.map((item) => ({
      label: item?.name ?? '',
      value: item?.name ?? '',
      type: ResourceAudienceType.TEAM,
      color: item?.metadata?.color_hex_code,
      team_id: item?.team_id,
    })) || []),
  ];

  const filteredOptionListsData = [
    ...(combinedOptionListsData
      ?.filter(
        (item) =>
          !selectedItems?.some((selected) => selected?.value === item?.value) &&
          !audiencesData?.some((audience) => audience?.user?.email === item?.value) &&
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

  const AccessComponent = resourceConfig.accessComponent;

  return (
    <div ref={popupRef} className='flex w-fit'>
      <div
        id={`share-${resourceType.toLowerCase()}-to-audience-btn`}
        onClick={handleTogglePopup}
        className={cn(
          openPopup && '!border !border-GRAY_400 !bg-GRAY_100',
          'f-13-500 text-black py-1.5 px-2.5 rounded-md cursor-pointer hover:bg-BG_GRAY_2 active:bg-GRAY_400 border border-GRAY_400 bg-white',
        )}
      >
        Share
      </div>
      <div className='relative'>
        {openPopup && (
          <div className='absolute flex flex-col w-[400px] right-0 top-9 z-[1200] bg-faded-white rounded-2xl'>
            <div className='border-0.5 border-GRAY_500 rounded-3.5 bg-white shadow-tableFilterMenu'>
              <div className='flex w-full justify-between items-center p-5'>
                <span className='f-16-600 text-GRAY_950'>Share this {resourceConfig.displayName}</span>
                <div className='p-1 cursor-pointer' onClick={handleClosePopup}>
                  <SvgSpriteLoader
                    id='x-close'
                    iconCategory={ICON_SPRITE_TYPES.GENERAL}
                    width={16}
                    height={16}
                    className='text-GRAY_800 hover:text-GRAY_1000'
                  />
                </div>
              </div>
              <div className='flex flex-col rounded-b-3.5 w-[400px]'>
                <div className='pt-0 px-4 pb-5'>
                  <MultiSelectInput
                    id={`share-${resourceType.toLowerCase()}`}
                    search={search}
                    setSearch={setSearch}
                    selectedRole={selectedRole as string}
                    setSelectedRole={setSelectedRole}
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
                    optionalOpenDropdownOptions={showInitialDropdownOptions}
                    selectOnlyFromList
                  />
                </div>
                <div className='flex items-center justify-between w-full py-4 px-5 border-t-0.5 border-GRAY_500'>
                  <span className='flex justify-center items-center f-11-500 gap-1.5 cursor-not-allowed'>
                    <SvgSpriteLoader
                      id='link-03'
                      iconCategory={ICON_SPRITE_TYPES.GENERAL}
                      width={12}
                      height={12}
                      color={COLORS.GRAY_1000}
                    />
                    <CopyToClipboardBrowserUrl />
                  </span>
                  <Button
                    type={BUTTON_TYPES.PRIMARY}
                    id='send-user-invite-btn'
                    size={SIZE_TYPES.SMALL}
                    disabled={!isResourceSharable}
                    onClick={handleShareResource}
                    isLoading={postInviteAudiencesIsLoading}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
            <div className='mt-2 rounded-3.5 py-2 pl-2 pr-4 border-0.5 border-GRAY_500 bg-white shadow-tableFilterMenu'>
              <span className='f-12-500 text-GRAY_700 p-2'>Who has access</span>
              <div className='flex flex-col w-full mt-2 max-h-[222px] overflow-y-auto [&::-webkit-scrollbar]:hidden'>
                <CommonWrapper
                  skeletonType={SkeletonTypes.CUSTOM}
                  isLoading={isLoadingAudiencesData}
                  loader={<WhoHasAccessSkeletonLoader />}
                >
                  {updatedUserAccessList?.map((audience, index) => (
                    <AccessComponent
                      key={index}
                      resourceId={resourceId}
                      resource_type={audience?.resource_type}
                      privilege={audience?.privilege}
                      resource_audience_id={audience?.resource_audience_id}
                      user={{ ...audience?.user, email: audience?.user?.email ?? '' }}
                      resource_audience_type={audience?.resource_audience_type}
                      userPrivilege={userPrivilege}
                      orgName={orgLabel}
                      customerName={orgName}
                      teamInfo={{ name: audience?.team_name, color: audience?.team_color }}
                    />
                  ))}
                </CommonWrapper>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareResourcePopup;
