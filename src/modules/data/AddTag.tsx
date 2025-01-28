import { useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { SIZE_TYPES } from 'types/common/components';
import { Button } from 'components/common/button/Button';
import Input from 'components/common/input';
import ToggleSwitch from 'components/common/toggleSwitch';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

const AddTag = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className='w-[300px]'>
      <div className='py-3'>
        <div className='flex items-center justify-between mb-3.5 px-3'>
          <div className='f-12-500 text-GRAY_1000'>Add Tag</div>
          <SvgSpriteLoader id='x-close' iconCategory={ICON_SPRITE_TYPES.GENERAL} width={12} height={12} />
        </div>
        <div className='px-4'>
          <Input placeholder='Search Tag' />
          <div className='rounded-md bg-BG_GRAY_2 px-3 py-2.5 f-11-400 text-GRAY_1000 border border-BORDER_GRAY_400 my-2.5'>
            bhdcj
          </div>
          <div className='flex items-center gap-1.5 mb-1.5'>
            <ToggleSwitch id='add-tag-make-rule' onChange={setIsActive} checked={isActive} />
            <div className='f-11-400 text-GRAY_1000'>Make this a rule</div>
          </div>
          <div className='f-11-400 text-GRAY_700'>
            Rule applies selected tags to all transactions meeting its criteria, historical & future, replacing any
            existing tags
          </div>
        </div>
      </div>
      <div className='flex flex-row-reverse items-center justify-between px-4 py-3 border-t border-BORDER_GRAY_400'>
        <Button size={SIZE_TYPES.XSMALL} id='add-tag-transactions'>
          Add tag to 2,398 transactions
        </Button>
      </div>
    </div>
  );
};

export default AddTag;
