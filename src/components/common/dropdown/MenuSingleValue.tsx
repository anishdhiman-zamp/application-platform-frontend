import React, { FC } from 'react';
import { MenuSingleValuePropsType } from 'types/common/components/dropdown/dropdown.types';
import { DROPDOWN_SIZE_STYLES } from 'components/common/dropdown/dropdown.constants';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

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
    <div className='tw-flex tw-items-center'>
      {spriteIcon && (
        <div className='tw-w-6 tw-mr-4'>
          <SvgSpriteLoader id={spriteIcon} />
        </div>
      )}
      {!showValueInControl && icon}
      <div className={customClassNames?.placeholder ?? DROPDOWN_SIZE_STYLES[size].customClassNames.placeholder}>
        {showValueInControl ? value : label}
      </div>
    </div>
  );
};

export default MenuSingleValue;
