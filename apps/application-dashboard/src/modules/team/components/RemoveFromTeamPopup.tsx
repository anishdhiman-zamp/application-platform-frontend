import React, { FC } from 'react';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { RemoveFromTeamPopupPropsType } from 'modules/team/people.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Popup from 'components/common/popup/Popup';

const RemoveFromTeamPopup: FC<RemoveFromTeamPopupPropsType> = ({
  feature,
  isOpen,
  onClose,
  onDelete,
  isLoading,
  warningDescription,
}) => {
  return (
    <Popup
      isOpen={isOpen}
      title='Remove from team'
      titleClassName='f-16-600 text-GRAY_950'
      iconCategory={ICON_SPRITE_TYPES.GENERAL}
      iconId='x-close'
      iconColor={COLORS.TEXT_PRIMARY}
      popupWrapperClassName='bg-white rounded-t-3.5'
      onClose={onClose}
      closeOnClickOutside={false}
    >
      <div className='rounded-b-3.5 flex w-[458px] flex-col bg-white'>
        <div className='f-14-400 text-GRAY_950 mt-6 flex flex-col items-center px-5 pb-5'>{warningDescription}</div>
        <div className='border-GRAY_200 flex w-full justify-end gap-2.5 border-t px-5 py-4'>
          <Button id={`${feature}-cancel-btn`} size={SIZE_TYPES.MEDIUM} type={BUTTON_TYPES.SECONDARY} onClick={onClose}>
            Cancel
          </Button>
          <Button
            id='delete-btn'
            size={SIZE_TYPES.MEDIUM}
            type={BUTTON_TYPES.DANGER}
            onClick={onDelete}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default RemoveFromTeamPopup;
