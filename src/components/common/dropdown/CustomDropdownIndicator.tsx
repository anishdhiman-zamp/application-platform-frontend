import React from 'react';
import { components, DropdownIndicatorProps } from 'react-select';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { SIZE_TYPES } from 'types/common/components';
import { OptionsType } from 'types/common/components/dropdown/dropdown.types';
import { DROPDOWN_SIZE_STYLES } from 'components/common/dropdown/dropdown.constants';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

export const CustomDropdownIndicator = (props: DropdownIndicatorProps<OptionsType>) => {
  const { selectProps = {} } = props;

  // @ts-ignore selectProps contains all props passed to react select. It's passed to each child component of react-select and takes custom props as well.
  const { size, menuIsOpen } = selectProps;

  return (
    <components.DropdownIndicator {...props}>
      <SvgSpriteLoader
        id={menuIsOpen ? 'chevron-up' : 'chevron-down'}
        iconCategory={ICON_SPRITE_TYPES.ARROWS}
        width={DROPDOWN_SIZE_STYLES[size as SIZE_TYPES].dropdownIndicatorProps.width}
        height={DROPDOWN_SIZE_STYLES[size as SIZE_TYPES].dropdownIndicatorProps.height}
        color={COLORS.GRAY_900}
      />
    </components.DropdownIndicator>
  );
};
