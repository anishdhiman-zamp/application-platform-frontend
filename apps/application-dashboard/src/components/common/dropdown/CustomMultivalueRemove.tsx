import React from 'react';
import { components, MultiValueRemoveProps } from 'react-select';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { COLORS } from 'constants/colors';
import { OptionsType } from 'types/commonTypes';

export const CustomMultivalueRemove = (props: MultiValueRemoveProps<OptionsType>) => {
  return (
    <components.MultiValueRemove {...props}>
      <SvgSpriteLoader
        id='x-close'
        iconCategory={ICON_SPRITE_TYPES.GENERAL}
        color={COLORS.TEXT_TERTIARY}
        width={16}
        height={16}
      />
    </components.MultiValueRemove>
  );
};
