import React, { ReactNode } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';

export type IconProps = {
  id: string;
  category?: ICON_SPRITE_TYPES;
  customIcon?: ReactNode;
  size?: number;
  className?: string;
};

const Icon = ({ id, category, customIcon, size, className }: IconProps) => {
  return (
    <div className=''>
      {customIcon ? (
        customIcon
      ) : (
        <SvgSpriteLoader id={id ?? ''} height={size} width={size} iconCategory={category} className={className} />
      )}
    </div>
  );
};

export default Icon;
