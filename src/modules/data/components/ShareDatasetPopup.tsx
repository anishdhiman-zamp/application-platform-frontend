import React, { FC, useRef, useState } from 'react';
import { useGetAudiencesByDatasetIdQuery, usePostShareDatasetToAudiencesByDatasetIdMutation } from 'apis/dataset';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import DatasetAccesToAudiences from 'modules/data/components/DatasetAccesToAudiences';
import { DATASET_ACCESS_PRIVILEGES_LIST } from 'modules/data/data.constants';
import { DatasetAccessPrivilegesType, ShareDatasetPopupPropsType } from 'modules/data/data.types';
import { AudiencesDatasetShareData } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Popup from 'components/common/popup/Popup';
import { toast } from 'components/common/toast/Toast';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const ShareDatasetPopup: FC<ShareDatasetPopupPropsType> = ({ isOpen, onClose, datasetId }) => {
  const selectedRoleRef = useRef<DatasetAccessPrivilegesType>(DATASET_ACCESS_PRIVILEGES_LIST[0]);
  const [inputArrayList, setInputArrayList] = useState<ArrayListOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const validationErrorText = 'Please select correct team or people within your organization';
  const placeholderText = 'Share with people and teams';
  const isDatasetSharable = !showValidationError && inputArrayList.length > 0;

  const { data: audiencesData } = useGetAudiencesByDatasetIdQuery({ datasetId }, { skip: !datasetId });
  const userAccessToDatasetList = audiencesData ?? [];
  const [postInviteAudiences] = usePostShareDatasetToAudiencesByDatasetIdMutation();

  const handleCloseDatasetPopup = () => {
    onClose?.();
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
      toast.success('Dataset shared successfully');
      handleCloseDatasetPopup();
    } catch {
      toast.error('Failed to share Dataset');
    }
  };

  return (
    <div>
      <Popup
        isOpen={isOpen}
        showIcon={true}
        title='Share this dataset'
        titleClassName='f-16-600 text-GRAY_950 px-1'
        iconCategory={ICON_SPRITE_TYPES.GENERAL}
        iconId='x-close'
        iconColor={COLORS.TEXT_PRIMARY}
        onClose={handleCloseDatasetPopup}
        popupWrapperClassName='bg-white border border-b-0 border-GRAY_400 rounded-t-3.5 py-5 px-4'
        closeOnClickOutside={false}
        isOverlay={false}
        wrapperClassName='justify-end items-start'
        className='py-10 px-4'
      >
        <div className='flex flex-col rounded-b-3.5 w-[400px] bg-white border border-t-0 border-GRAY_400'>
          <div className='pt-0 px-5 pb-5'>
            <MultiSelectInput
              inputArrayList={inputArrayList}
              setInputArrayList={setInputArrayList}
              checkAudiencePresentInOrg={true}
              search={search}
              setSearch={setSearch}
              selectedRoleRef={selectedRoleRef}
              showValidationError={showValidationError}
              validationErrorText={validationErrorText}
              isOpen={isOpen}
              setShowValidationError={setShowValidationError}
              placeholderText={placeholderText}
              dropdownOptions={[]}
              roleOptions={DATASET_ACCESS_PRIVILEGES_LIST}
              customDropdownMenuClass={{
                width: '120px',
                marginLeft: '-24px',
              }}
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
        {userAccessToDatasetList?.length > 0 && (
          <div className='bg-white mt-2 rounded-3.5 p-2 border border-GRAY_400'>
            <span className='f-12-500 text-GRAY_700 p-2'>Who has access</span>
            <div className='flex flex-col w-full mt-2 max-h-[200px] overflow-y-scroll'>
              {userAccessToDatasetList?.map((audience, index) => <DatasetAccesToAudiences key={index} {...audience} />)}
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
};

export default ShareDatasetPopup;
