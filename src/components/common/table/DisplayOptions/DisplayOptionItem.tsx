import React, { FC } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

export type DisplayOptionItemProps = {
  id: string;
  label: string;
  iconId: string;
  iconCategory: ICON_SPRITE_TYPES;
  onClick?: (id: string) => void;
};

const DisplayOptionItem: FC<DisplayOptionItemProps> = ({ id, label, iconId, iconCategory, onClick }) => {
  return (
    <div
      key={id}
      className='flex items-center justify-between py-2 px-2.5 hover:bg-GRAY_100 group cursor-pointer rounded-md'
      onClick={() => onClick?.(id)}
    >
      <div className='flex items-center gap-1.5'>
        <SvgSpriteLoader id={iconId} iconCategory={iconCategory} width={12} height={12} />
        <div className='f-12-500'>{label}</div>
      </div>
      <SvgSpriteLoader
        id='arrow-narrow-right'
        iconCategory={ICON_SPRITE_TYPES.ARROWS}
        width={12}
        height={12}
        className='group-hover:opacity-100 opacity-0'
      />
    </div>
  );
};

export default DisplayOptionItem;
