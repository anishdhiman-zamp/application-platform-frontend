import React, { FC, useRef, useState } from 'react';
import { useGetAudiencesByPageIdQuery, usePostPagesToAudiencesByPageIdMutation } from 'apis/pages';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { DATASET_ACCESS_PRIVILEGES_LIST } from 'modules/data/data.constants';
import { DatasetAccessPrivilegesType } from 'modules/data/data.types';
import PageAccessToAudiences from 'modules/page/PageAccessToAudience';
import { PAGE_ACCESS_PRIVILEGES_LIST } from 'modules/page/pages.constants';
import { SharePagePopupPropsType } from 'modules/page/pages.types';
import { AudiencesDatasetShareData } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const SharePagePopup: FC<SharePagePopupPropsType> = ({ pageId }) => {
  const [openSharePagePopup, setOpenSharePagePopup] = useState<boolean>(false);
  const selectedRoleRef = useRef<DatasetAccessPrivilegesType>(DATASET_ACCESS_PRIVILEGES_LIST[0]);
  const [inputArrayList, setInputArrayList] = useState<ArrayListOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const validationErrorText = 'Please select correct team or people within your organization';
  const placeholderText = 'Share with people and teams';
  const isDatasetSharable = !showValidationError && inputArrayList.length > 0;
  const { refetch: refetchAudiencesByPageId } = useGetAudiencesByPageIdQuery({ pageId }, { skip: !pageId });
  const { data: audiencesData } = useGetAudiencesByPageIdQuery({ pageId }, { skip: !pageId });
  const userAccessToDatasetList = audiencesData ?? [];
  const [postInviteAudiences] = usePostPagesToAudiencesByPageIdMutation();

  const handleOpenSharePagePopup = () => {
    setOpenSharePagePopup(true);
  };

  const handleCloseSharePagePopup = () => {
    setOpenSharePagePopup(false);
    setShowValidationError(false);
    setInputArrayList([]);
    setSearch('');
  };

  const AudiencesSharePageData: AudiencesDatasetShareData = {
    audiences: inputArrayList.map((item) => ({
      audience_type: item?.resource_audience_type ?? '',
      audience_id: item?.resource_audience_id ?? '',
      role: item?.role ?? '',
    })),
  };

  const handleSharePagePopup = async () => {
    try {
      await postInviteAudiences({ pageId, body: AudiencesSharePageData }).unwrap();
      refetchAudiencesByPageId();
      toast.success('Page shared successfully');
    } catch {
      toast.error('Failed to share Page');
    }
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
            <div className='border border-GRAY_400 rounded-3.5 bg-white'>
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
                    id='share-page-'
                    inputArrayList={inputArrayList}
                    setInputArrayList={setInputArrayList}
                    checkAudiencePresentInOrg
                    search={search}
                    setSearch={setSearch}
                    selectedRoleRef={selectedRoleRef}
                    showValidationError={showValidationError}
                    validationErrorText={validationErrorText}
                    isOpen={openSharePagePopup}
                    setShowValidationError={setShowValidationError}
                    placeholderText={placeholderText}
                    dropdownOptions={[]}
                    roleOptions={PAGE_ACCESS_PRIVILEGES_LIST}
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
                    disabled={!isDatasetSharable}
                    onClick={handleSharePagePopup}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
            {userAccessToDatasetList?.length > 0 && (
              <div className='mt-2 rounded-3.5 p-2 border border-GRAY_400 bg-white'>
                <span className='f-12-500 text-GRAY_700 p-2'>Who has access</span>
                <div className='flex flex-col w-full mt-2 max-h-[200px] overflow-y-scroll'>
                  {userAccessToDatasetList?.map((audience, index) => (
                    <PageAccessToAudiences key={index} {...audience} pageId={pageId} />
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
