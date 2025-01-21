import React, { useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Input from 'components/common/input';

const PeopleHeader = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

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
        <Button type={BUTTON_TYPES.PRIMARY} id='' size={SIZE_TYPES.SMALL} onClick={() => {}}>
          Invite members
        </Button>
      </div>
    </>
  );
};

export default PeopleHeader;
