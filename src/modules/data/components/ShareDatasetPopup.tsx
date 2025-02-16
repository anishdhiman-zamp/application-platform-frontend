import React, { FC, useRef, useState } from 'react';
import { useGetAudiencesByDatasetIdQuery, usePostShareDatasetToAudiencesByDatasetIdMutation } from 'apis/dataset';
import { useGetAudiencesByOrganisationIdQuery } from 'apis/people';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { useAppSelector } from 'hooks/toolkit';
import DatasetAccessToAudiences from 'modules/data/components/DatasetAccessToAudiences';
import { DATASET_ACCESS_PRIVILEGES_LIST } from 'modules/data/data.constants';
import { DatasetAccessPrivilegesType, ShareDatasetPopupPropsType } from 'modules/data/data.types';
import { validateEmail } from 'modules/people/people.utils';
import { RootState } from 'store';
import { ResourceAudienceType } from 'types/api/auth.types';
import { AudiencesDatasetShareData } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { accessPermissionForDataset } from 'utils/accessPermission/accessPermission';
import { PERMISSION_MESSAGES, VALIDATION_ERROR_MESSAGES } from 'utils/accessPermission/accessPermission.constants';
import { PERMISSION_ROLES, PERMISSION_TYPES } from 'utils/accessPermission/accessPermission.types';
import { getUserEmail, getUserPrivilege } from 'utils/accessPermission/accessPermission.utils';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const ShareDatasetPopup: FC<ShareDatasetPopupPropsType> = ({ datasetId }) => {
  const shareDatasetPopupRef = useRef<HTMLDivElement>(null);
  const selectedRoleRef = useRef<DatasetAccessPrivilegesType>(DATASET_ACCESS_PRIVILEGES_LIST[0]);
  const [search, setSearch] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [validationErrorText, setValidationErrorText] = useState<string>('');
  const [openShareDatasetPopup, setOpenShareDatasetPopup] = useState<boolean>(false);
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: teamMembersData } = useGetAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });
  const { data: getAudiencesByDatasetId, refetch: refetchAudiencesByDatasetId } = useGetAudiencesByDatasetIdQuery(
    { datasetId },
    { skip: !datasetId },
  );
  const [postInviteAudiences, { isLoading: postInviteAudiencesIsLoading }] =
    usePostShareDatasetToAudiencesByDatasetIdMutation();
  const userAccessToDatasetList = getAudiencesByDatasetId ?? [];
  const placeholderText = 'Share with people and teams';
  const user_email = getUserEmail();
  const user_role = getUserPrivilege();
  const userPrivilege =
    getAudiencesByDatasetId?.find((audience) => audience?.user?.email === user_email)?.privilege ?? user_role ?? '';
  const isDatasetSharable =
    !showValidationError && selectedItems.length > 0 && userPrivilege !== PERMISSION_ROLES.DATA_READER;
  const checkPermission = accessPermissionForDataset(userPrivilege);
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name);
  const orgLabel = `Everyone in ${orgName}`;

  const handleOpenShareDatasetPopup = () => {
    setOpenShareDatasetPopup(true);
  };

  const handleCloseShareDatasetPopup = () => {
    setOpenShareDatasetPopup(false);
    setShowValidationError(false);
    setSelectedItems([]);
    setSearch('');
  };

  useOnClickOutside(shareDatasetPopupRef, handleCloseShareDatasetPopup);

  const AudiencesDatasetShareData: AudiencesDatasetShareData = {
    audiences: selectedItems.map((item) => ({
      audience_type: item?.resource_audience_type ?? '',
      audience_id: item?.resource_audience_id ?? '',
      role: item?.role ?? '',
    })),
  };

  const handleShareDatasetPopup = () => {
    if (!checkPermission) {
      toast.error(PERMISSION_MESSAGES[PERMISSION_TYPES.INVITE]);

      return;
    } else {
      postInviteAudiences({ datasetId, body: AudiencesDatasetShareData })
        .unwrap()
        .then(() => {
          setSelectedItems([]);
          refetchAudiencesByDatasetId();
          toast.success(TOAST_MESSAGES.SUCCESS_DATASET_SHARED);
        })
        .catch((err) => {
          toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_DATASET_SHARED);
        });
    }
  };

  const customizedTeamMembersData = [
    { label: orgLabel ?? '', value: orgName ?? '', type: ResourceAudienceType.ORGANIZATION },
    ...(teamMembersData?.map((member) => ({
      label: member?.user?.email ?? '',
      value: member?.user?.email ?? '',
      type: member?.resource_audience_type ?? '',
    })) || []),
  ];

  const validateAndGetUserDetails = (value: string) => {
    const isValid = validateEmail(value);
    let resource_audience_id = '';
    let resource_audience_type = '';

    const isOrgAlreadyInvited = getAudiencesByDatasetId?.some(
      (item) => item?.resource_audience_type === ResourceAudienceType.ORGANIZATION,
    );

    if (isOrgAlreadyInvited && value === orgName) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.ORG_ALREADY_HAS_ACCESS };
    }

    if (!isValid) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.INVALID_EMAIL };
    }

    const audience = teamMembersData?.find((audience) => audience?.user?.email === value);

    if (!audience) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.USER_NOT_IN_ORG };
    }

    const isAlreadyInvited = getAudiencesByDatasetId?.some((item) => item?.user?.email === value);

    if (isAlreadyInvited) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.USER_ALREADY_HAS_ACCESS };
    }

    if (value === user_email) {
      return { isValid: false, message: VALIDATION_ERROR_MESSAGES.CANNOT_ADD_SELF };
    }

    resource_audience_type = audience?.resource_audience_type ?? '';
    resource_audience_id = audience?.resource_audience_id ?? '';

    return { isValid: true, resource_audience_type, resource_audience_id };
  };

  const handleValidateAndAdd = (value: string) => {
    const { isValid, message, resource_audience_type, resource_audience_id } = validateAndGetUserDetails(value);

    setSelectedItems((prev) => {
      const updatedItems = [
        ...prev,
        {
          value,
          valid: isValid,
          role: selectedRoleRef?.current?.value,
          color: isValid ? COLORS.WHITE : COLORS.RED_100,
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

  const handleOptionSelection = (option: { value: string; label: string }) => {
    const { isValid, message, resource_audience_type, resource_audience_id } = validateAndGetUserDetails(option?.value);

    setSelectedItems((prev) => {
      const updatedItems = [
        ...prev,
        {
          value: option.value,
          valid: isValid,
          color: isValid ? COLORS.WHITE : COLORS.RED_100,
          role: selectedRoleRef?.current?.value,
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

  return (
    <div className='flex w-fit'>
      <Button
        type={BUTTON_TYPES.SECONDARY}
        id='share-dataset-to-audience'
        size={SIZE_TYPES.SMALL}
        className='!bg-GRAY_100'
        onClick={handleOpenShareDatasetPopup}
      >
        Share
      </Button>
      <div className='relative'>
        {openShareDatasetPopup && (
          <div ref={shareDatasetPopupRef} className='absolute flex flex-col w-[400px] right-0 top-8 z-1000'>
            <div className='border border-GRAY_400 rounded-3.5 bg-white shadow-tableFilterMenu'>
              <div className='flex w-full justify-between items-center pt-5 pb-6 py-5 px-4'>
                <span className=''>Share this dataset</span>
                <div className='p-1 cursor-pointer' onClick={handleCloseShareDatasetPopup}>
                  <SvgSpriteLoader
                    id='x-close'
                    iconCategory={ICON_SPRITE_TYPES.GENERAL}
                    width={16}
                    height={16}
                    color={COLORS.TEXT_PRIMARY}
                  />
                </div>
              </div>
              <div className='flex flex-col rounded-b-3.5 w-[400px]'>
                <div className='pt-0 px-5 pb-5'>
                  <MultiSelectInput
                    id='share-dataset'
                    search={search}
                    setSearch={setSearch}
                    selectedRoleRef={selectedRoleRef}
                    isOpen={openShareDatasetPopup}
                    placeholderText={placeholderText}
                    roleOptions={DATASET_ACCESS_PRIVILEGES_LIST}
                    inputArrayList={selectedItems}
                    setInputArrayList={setSelectedItems}
                    validationErrorText={validationErrorText}
                    showValidationError={showValidationError}
                    setShowValidationError={setShowValidationError}
                    onValidateAndAdd={handleValidateAndAdd}
                    optionsList={customizedTeamMembersData}
                    onSelectOption={handleOptionSelection}
                  />
                </div>
                <div className='flex items-center justify-between w-full py-4 px-5 border-t border-GRAY_400'>
                  <span className='flex justify-center items-center f-11-500 gap-1.5 cursor-not-allowed'>
                    <SvgSpriteLoader
                      id='link-03'
                      iconCategory={ICON_SPRITE_TYPES.GENERAL}
                      width={12}
                      height={12}
                      color={COLORS.GRAY_600}
                    />
                    <span className='f-11-500 text-GRAY_600'>Copy link</span>
                  </span>
                  <Button
                    type={BUTTON_TYPES.PRIMARY}
                    id='send-user-invite-btn'
                    size={SIZE_TYPES.SMALL}
                    disabled={!isDatasetSharable}
                    onClick={handleShareDatasetPopup}
                    isLoading={postInviteAudiencesIsLoading}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
            {userAccessToDatasetList?.length > 0 && (
              <div className='mt-2 rounded-3.5 py-2 pl-2 pr-4 border border-GRAY_400 bg-white shadow-tableFilterMenu'>
                <span className='f-12-500 text-GRAY_700 p-2'>Who has access</span>
                <div className='flex flex-col w-full mt-2 max-h-[200px] overflow-y-auto ag-body-vertical-scroll'>
                  {userAccessToDatasetList?.map((audience, index) => (
                    <DatasetAccessToAudiences
                      key={index}
                      datasetId={datasetId}
                      resource_type={audience?.resource_type}
                      privilege={audience?.privilege}
                      resource_audience_id={audience?.resource_audience_id}
                      user={{ ...audience?.user, email: audience?.user?.email ?? '' }}
                      resource_audience_type={audience?.resource_audience_type}
                      userPrivilege={userPrivilege}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareDatasetPopup;
