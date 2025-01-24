import React, { FC, useRef, useState } from 'react';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/people/people.constants';
import { InviteMembersPopupPropsType, TeamMembersPrivilegeType } from 'modules/people/people.types';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Popup from 'components/common/popup/Popup';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';

const InviteMembersPopup: FC<InviteMembersPopupPropsType> = ({ isOpen, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRoleRef = useRef<TeamMembersPrivilegeType>(TEAM_MEMBERS_PRIVILEGES_LIST[0]);
  const [inputArrayList, setInputArrayList] = useState<ArrayListOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const validationErrorText = 'Email address incorrect';
  const placeholderText = 'Share with people and teams';

  const handleCloseInviteMembersPopup = () => {
    onClose?.();
    setShowValidationError(false);
    setInputArrayList([]);
    setSearch('');
  };

  return (
    <Popup
      isOpen={isOpen}
      showIcon={true}
      title='Invite Members'
      titleClassName='f-16-600 text-GRAY_950'
      iconCategory={ICON_SPRITE_TYPES.GENERAL}
      iconId='x-close'
      iconColor={COLORS.TEXT_PRIMARY}
      onClose={handleCloseInviteMembersPopup}
      popupWrapperClassName='bg-white rounded-t-3.5'
      closeOnClickOutside={false}
    >
      <div className='flex flex-col rounded-b-3.5 w-[458px] bg-white'>
        <div className='px-4 py-6'>
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
            roleOptions={TEAM_MEMBERS_PRIVILEGES_LIST}
          />
        </div>
        <div className='flex justify-end border-t border-GRAY_200 py-4 px-5 w-full'>
          <Button type={BUTTON_TYPES.PRIMARY} id='send-user-invite-btn' size={SIZE_TYPES.MEDIUM}>
            Send invite
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default InviteMembersPopup;
