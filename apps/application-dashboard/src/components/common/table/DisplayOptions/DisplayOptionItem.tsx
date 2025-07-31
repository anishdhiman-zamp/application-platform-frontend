import React, { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { DISPLAY_OPTIONS } from 'components/common/table/table.types';

export type DisplayOptionItemProps = {
  id: DISPLAY_OPTIONS;
  label: string;
  iconId: string;
  onClick?: (id: DISPLAY_OPTIONS) => void;
  value?: string;
};

const DisplayOptionItem: FC<DisplayOptionItemProps> = ({ id, label, iconId, onClick, value }) => {
  return (
    <div
      key={id}
      className='hover:bg-GRAY_100 group flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2'
      onClick={() => onClick?.(id)}
    >
      <div className='flex items-center gap-1.5'>
        <SvgSpriteLoader id={iconId} width={12} height={12} />
        <div className='f-12-500'>{label}</div>
      </div>
      <div className='flex items-center gap-1.5'>
        {value && <span className='text-GRAY_700 f-12-400'>{value}</span>}
        <SvgSpriteLoader
          id='arrow-narrow-right'
          iconCategory={ICON_SPRITE_TYPES.ARROWS}
          width={12}
          height={12}
          className='opacity-0 group-hover:opacity-100'
        />
      </div>
    </div>
  );
};

export default DisplayOptionItem;
