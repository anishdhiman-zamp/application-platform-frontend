import React, { FC, useRef, useState } from 'react';
import { useGetAudiencesByDatasetIdQuery, usePostShareDatasetToAudiencesByDatasetIdMutation } from 'apis/dataset';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import DatasetAccessToAudiences from 'modules/data/components/DatasetAccessToAudiences';
import { DATASET_ACCESS_PRIVILEGES_LIST } from 'modules/data/data.constants';
import { DatasetAccessPrivilegesType, ShareDatasetPopupPropsType } from 'modules/data/data.types';
import { AudiencesDatasetShareData } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import { toast } from 'components/common/toast/Toast';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const ShareDatasetPopup: FC<ShareDatasetPopupPropsType> = ({ datasetId }) => {
  const [openShareDatasetPopup, setOpenShareDatasetPopup] = useState<boolean>(false);
  const selectedRoleRef = useRef<DatasetAccessPrivilegesType>(DATASET_ACCESS_PRIVILEGES_LIST[0]);
  const [inputArrayList, setInputArrayList] = useState<ArrayListOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const validationErrorText = 'Please select correct team or people within your organization';
  const placeholderText = 'Share with people and teams';
  const isDatasetSharable = !showValidationError && inputArrayList.length > 0;
  const { refetch: refetchAudiencesByDatasetId } = useGetAudiencesByDatasetIdQuery({ datasetId }, { skip: !datasetId });
  const { data: audiencesData } = useGetAudiencesByDatasetIdQuery({ datasetId }, { skip: !datasetId });
  const userAccessToDatasetList = audiencesData ?? [];
  const [postInviteAudiences] = usePostShareDatasetToAudiencesByDatasetIdMutation();

  const handleOpenShareDatasetPopup = () => {
    setOpenShareDatasetPopup(true);
  };

  const handleCloseShareDatasetPopup = () => {
    setOpenShareDatasetPopup(false);
    setShowValidationError(false);
    setInputArrayList([]);
    setSearch('');
  };

  const AudiencesDatasetShareData: AudiencesDatasetShareData = {
    audiences: inputArrayList.map((item) => ({
      audience_type: item?.resource_audience_type ?? '',
      audience_id: item?.resource_audience_id ?? '',
      role: item?.role ?? '',
    })),
  };

  const handleShareDatasetPopup = async () => {
    try {
      await postInviteAudiences({ datasetId, body: AudiencesDatasetShareData }).unwrap();
      refetchAudiencesByDatasetId();
      toast.success('Dataset shared successfully');
    } catch {
      toast.error('Failed to share Dataset');
    }
  };

  return (
    <div className='flex w-fit'>
      <Button
        type={BUTTON_TYPES.SECONDARY}
        id='send-user-invite-btn'
        size={SIZE_TYPES.SMALL}
        className='!bg-GRAY_100'
        onClick={handleOpenShareDatasetPopup}
      >
        Share
      </Button>
      <div className='relative'>
        {openShareDatasetPopup && (
          <div className='absolute flex flex-col w-[400px] right-0 top-8 z-1000'>
            <div className='border border-GRAY_400 rounded-3.5 bg-white'>
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
                    inputArrayList={inputArrayList}
                    setInputArrayList={setInputArrayList}
                    checkAudiencePresentInOrg
                    search={search}
                    setSearch={setSearch}
                    selectedRoleRef={selectedRoleRef}
                    showValidationError={showValidationError}
                    validationErrorText={validationErrorText}
                    isOpen={openShareDatasetPopup}
                    setShowValidationError={setShowValidationError}
                    placeholderText={placeholderText}
                    dropdownOptions={[]}
                    roleOptions={DATASET_ACCESS_PRIVILEGES_LIST}
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
                    onClick={handleShareDatasetPopup}
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
                    <DatasetAccessToAudiences key={index} {...audience} datasetId={datasetId} />
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
