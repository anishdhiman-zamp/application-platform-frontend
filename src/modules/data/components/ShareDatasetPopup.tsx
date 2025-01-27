import React, { FC, useRef, useState } from 'react';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { DATASET_ACCESS_PRIVILEGES_LIST, TEAM_OPTIONS_LIST } from 'modules/data/data.constants';
import {
  DatasetAccessPrivilegesType,
  ShareDatasetPopupPropsType,
  UserAccessToDataSetType,
} from 'modules/data/data.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import Avatar from 'components/common/avatar';
import { Button } from 'components/common/button/Button';
import Popup from 'components/common/popup/Popup';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const ShareDatasetPopup: FC<ShareDatasetPopupPropsType> = ({ isOpen, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRoleRef = useRef<DatasetAccessPrivilegesType>(DATASET_ACCESS_PRIVILEGES_LIST[0]);
  const [inputArrayList, setInputArrayList] = useState<ArrayListOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const validationErrorText = 'Please select correct team or people';
  const placeholderText = 'Share with people and teams';
  const userAccessToDatasetList: UserAccessToDataSetType = [];
  const isDatasetSharable = !showValidationError && inputArrayList.length > 0;

  const handleCloseInviteMembersPopup = () => {
    onClose?.();
    setShowValidationError(false);
    setInputArrayList([]);
    setSearch('');
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
        onClose={handleCloseInviteMembersPopup}
        popupWrapperClassName='bg-white border-l border-t border-r border-GRAY_400 rounded-t-3.5 py-5 px-4'
        closeOnClickOutside={false}
        isOverlay={false}
        wrapperClassName='justify-end items-start'
        className='py-10 px-4'
      >
        <div className='flex flex-col rounded-b-3.5 w-[400px] bg-white border-l border-b border-r border-GRAY_400'>
          <div className='pt-0 px-5 pb-5'>
            <MultiSelectInput
              inputArrayList={inputArrayList}
              setInputArrayList={setInputArrayList}
              containerRef={containerRef}
              inputRef={inputRef}
              search={search}
              setSearch={setSearch}
              selectedRoleRef={selectedRoleRef}
              showValidationError={showValidationError}
              validationErrorText={validationErrorText}
              isOpen={isOpen}
              setShowValidationError={setShowValidationError}
              placeholderText={placeholderText}
              dropdownOptions={TEAM_OPTIONS_LIST}
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
            >
              Share
            </Button>
          </div>
        </div>
        {userAccessToDatasetList?.length > 0 && (
          <div className='bg-white mt-2 rounded-3.5 p-2 border border-GRAY_400'>
            <span className='f-12-500 text-GRAY_700 p-2'>Who has access</span>
            <div className='flex flex-col w-full mt-2 max-h-[200px] overflow-y-scroll'>
              {userAccessToDatasetList?.map((item, index) => (
                <div key={index} className='f-12-400 py-3 px-2 bg-white flex justify-between items-start'>
                  <div className='flex items-start justify-start gap-x-1 w-[120px]'>
                    <div className='w-fit'>
                      <Avatar
                        name={item?.user?.name}
                        backgroundColor={COLORS.GRAY_1000}
                        className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
                      />
                    </div>
                    <span>{item?.user?.name}</span>
                  </div>
                  <span className='flex items-start justify-start w-[90px]'>{item?.dataset}</span>
                  <span className='flex items-start justify-start w-[90px]'>{item?.previlege}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
};

export default ShareDatasetPopup;
