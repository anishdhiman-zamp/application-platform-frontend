import React, { useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import InviteMembersPopup from 'modules/people/InviteMembersPopup';
import { PEOPLE_TABS_LIST } from 'modules/people/people.constants';
import { SIZE_TYPES, TAB_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Input from 'components/common/input';
import { Tabs } from 'components/common/tabs/Tabs';

const PeopleHeader = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [isInviteMembersPopupOpen, setIsInviteMembersPopupOpen] = useState(false);
  
  const handleOpenInviteMembersPopup = () => {
    setIsInviteMembersPopupOpen(true);
  };
  const handleCloseInviteMembersPopup = () => {
    setIsInviteMembersPopupOpen(false);
  };

  return (
    <>
      <div className='f-20-600 text-GRAY_1000'>People</div>
      <div className='flex justify-between items-center w-full mt-5'>
        <Input
          placeholder='Search people'
          className='w-80'
          inputRef={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leadingIconProps={{
            id: 'search-sm',
            iconCategory: ICON_SPRITE_TYPES.GENERAL,
            className: 'text-GRAY_700',
          }}
          size={SIZE_TYPES.SMALL}
        />
        <Button type={BUTTON_TYPES.PRIMARY} id='invite-user-btn' size={SIZE_TYPES.SMALL} onClick={handleOpenInviteMembersPopup}>
          Invite members
        </Button>
        <InviteMembersPopup isOpen={isInviteMembersPopupOpen} onClose={handleCloseInviteMembersPopup} />
      </div>
      <div className='mt-4'>
        <Tabs list={PEOPLE_TABS_LIST} id='' type={TAB_TYPES.UNDERLINE} />
      </div>
    </>
  );
};

export default PeopleHeader;
