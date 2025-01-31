import React, { FC, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetAudiencesByPageIdQuery, usePostPagesToAudiencesByPageIdMutation } from 'apis/pages';
import { useGetAudiencesByOrganisationIdQuery } from 'apis/people';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useAppSelector } from 'hooks/toolkit';
import { DATASET_ACCESS_PRIVILEGES_LIST } from 'modules/data/data.constants';
import { DatasetAccessPrivilegesType } from 'modules/data/data.types';
import PageAccessToAudiences from 'modules/page/PageAccessToAudience';
import { PAGE_ACCESS_PRIVILEGES_LIST } from 'modules/page/pages.constants';
import { SharePagePopupPropsType } from 'modules/page/pages.types';
import { validateEmail } from 'modules/people/people.utils';
import { RootState } from 'store';
import { AudiencesDatasetShareData } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const SharePagePopup: FC<SharePagePopupPropsType> = ({ pageId }) => {
  const selectedRoleRef = useRef<DatasetAccessPrivilegesType>(DATASET_ACCESS_PRIVILEGES_LIST[0]);
  const [search, setSearch] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [validationErrorText, setValidationErrorText] = useState<string>('');
  const [openSharePagePopup, setOpenSharePagePopup] = useState<boolean>(false);
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const { data: teamMembersData } = useGetAudiencesByOrganisationIdQuery({ organizationId }, { skip: !organizationId });
  const { data: getAudiencesByPageId, refetch: refetchAudiencesByPageId } = useGetAudiencesByPageIdQuery(
    { pageId },
    { skip: !pageId },
  );
  const [postInviteAudiences] = usePostPagesToAudiencesByPageIdMutation();
  const userAccessToDatasetList = getAudiencesByPageId ?? [];
  const placeholderText = 'Share with people and teams';
  const checkIfUser = useSelector((state: RootState) => state?.user?.user)?.user_email;
  const isPageSharable = !showValidationError && selectedItems.length > 0;

  const handleOpenSharePagePopup = () => {
    setOpenSharePagePopup(true);
  };

  const handleCloseSharePagePopup = () => {
    setOpenSharePagePopup(false);
    setShowValidationError(false);
    setSelectedItems([]);
    setSearch('');
  };

  const AudiencesSharePageData: AudiencesDatasetShareData = {
    audiences: selectedItems.map((item) => ({
      audience_type: item?.resource_audience_type ?? '',
      audience_id: item?.resource_audience_id ?? '',
      role: item?.role ?? '',
    })),
  };

  const handleSharePagePopup = async () => {
    try {
      await postInviteAudiences({ pageId, body: AudiencesSharePageData }).unwrap();
      setSelectedItems([]);
      refetchAudiencesByPageId();
      toast.success('Page shared successfully');
    } catch {
      toast.error('Failed to share Page');
    }
  };

  const customizedTeamMembersData = teamMembersData?.map((member) => ({
    label: member?.user?.email,
    value: member?.user?.email,
  }));

  const validateAndGetUserDetails = (value: string) => {
    const isValid = validateEmail(value);
    let resource_audience_id = '';
    let resource_audience_type = '';

    if (!isValid) {
      return { isValid: false, message: 'Email address incorrect' };
    }

    const audience = teamMembersData?.find((audience) => audience?.user?.email === value);

    if (!audience) {
      return { isValid: false, message: 'User is not present in the organization' };
    }

    const isAlreadyInvited = getAudiencesByPageId?.some((item) => item?.user?.email === value);

    if (isAlreadyInvited) {
      return { isValid: false, message: 'User is already invited' };
    }

    if (value === checkIfUser) {
      return { isValid: false, message: 'You cannot invite yourself' };
    }

    resource_audience_type = audience?.resource_audience_type ?? '';
    resource_audience_id = audience?.resource_audience_id ?? '';

    return { isValid: true, resource_audience_type, resource_audience_id };
  };

  const handleValidateAndAdd = (value: string) => {
    const { isValid, message, resource_audience_type, resource_audience_id } = validateAndGetUserDetails(value);

    if (!isValid) {
      setValidationErrorText(message ?? '');
      setShowValidationError(true);
    } else {
      setShowValidationError(false);
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        value,
        valid: isValid,
        role: selectedRoleRef?.current?.value,
        color: isValid ? COLORS.WHITE : COLORS.RED_100,
        resource_audience_type,
        resource_audience_id,
      },
    ]);
  };

  const handleOptionSelection = (option: { value: string; label: string }) => {
    const { isValid, message, resource_audience_type, resource_audience_id } = validateAndGetUserDetails(option?.value);

    if (!isValid) {
      setShowValidationError(true);
      setValidationErrorText(message ?? '');
    } else {
      setShowValidationError(false);
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        value: option.value,
        valid: isValid,
        color: isValid ? COLORS.WHITE : COLORS.RED_100,
        role: selectedRoleRef?.current?.value,
        resource_audience_type,
        resource_audience_id,
      },
    ]);
  };

  return (
    <div className='flex w-fit'>
      <Button
        type={BUTTON_TYPES.SECONDARY}
        id='send-user-invite-btn'
        size={SIZE_TYPES.SMALL}
        className='!bg-GRAY_100'
        onClick={handleOpenSharePagePopup}
      >
        Share
      </Button>
      <div className='relative'>
        {openSharePagePopup && (
          <div className='absolute flex flex-col w-[400px] right-0 top-8 z-1000'>
            <div className='border border-GRAY_400 rounded-3.5 bg-white shadow-tableFilterMenu'>
              <div className='flex w-full justify-between items-center pt-5 pb-6 py-5 px-4'>
                <span className=''>Share this page</span>
                <div className='p-1 cursor-pointer' onClick={handleCloseSharePagePopup}>
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
                    id='share-page'
                    search={search}
                    setSearch={setSearch}
                    selectedRoleRef={selectedRoleRef}
                    isOpen={openSharePagePopup}
                    placeholderText={placeholderText}
                    roleOptions={PAGE_ACCESS_PRIVILEGES_LIST}
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
                      color={COLORS.GRAY_1000}
                    />
                    <span>Copy link</span>
                  </span>
                  <Button
                    type={BUTTON_TYPES.PRIMARY}
                    id='send-user-invite-btn'
                    size={SIZE_TYPES.SMALL}
                    disabled={!isPageSharable}
                    onClick={handleSharePagePopup}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
            {userAccessToDatasetList?.length > 0 && (
              <div className='mt-2 rounded-3.5 p-2 border border-GRAY_400 bg-white shadow-tableFilterMenu'>
                <span className='f-12-500 text-GRAY_700 p-2'>Who has access</span>
                <div className='flex flex-col w-full mt-2 max-h-[200px] overflow-y-scroll'>
                  {userAccessToDatasetList?.map((audience, index) => (
                    <PageAccessToAudiences
                      key={index}
                      resource_type={audience.resource_type}
                      privilege={audience.privilege}
                      resource_audience_id={audience.resource_audience_id}
                      user={{ ...audience.user, email: audience.user?.email ?? '' }}
                      pageId={pageId}
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

export default SharePagePopup;
