import React, { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { MenuSingleValuePropsType } from 'types/common/components/dropdown/dropdown.types';
import { DROPDOWN_SIZE_STYLES } from 'components/common/dropdown/dropdown.constants';

const MenuSingleValue: FC<MenuSingleValuePropsType> = ({
  icon,
  label,
  spriteIcon,
  value,
  showValueInControl,
  size,
  customClassNames,
}) => {
  return (
    <div className='flex items-center'>
      {spriteIcon && (
        <div className='mr-4 w-6'>
          <SvgSpriteLoader id={spriteIcon} />
        </div>
      )}
      {!showValueInControl && icon}
      <div
        className={cn(
          customClassNames?.placeholder ?? DROPDOWN_SIZE_STYLES[size].customClassNames.placeholder,
          customClassNames?.color,
        )}
      >
        {showValueInControl ? value : label}
      </div>
    </div>
  );
};

export default MenuSingleValue;
