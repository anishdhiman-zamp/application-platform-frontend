import React, { FC } from 'react';
import { COLORS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { ResetSectionProps } from 'types/common/components/dropdown/dropdown.types';
import { cn } from 'utils/common';

export const ResetSection: FC<ResetSectionProps> = ({ resetProps, onClickReset }) => {
  return (
    <div
      className={cn('border-DIVIDER_GRAY flex border-t py-3 pl-4', resetProps?.resetClassName)}
      onClick={onClickReset}
    >
      <SvgSpriteLoader
        id='refresh-ccw-01'
        iconCategory={ICON_SPRITE_TYPES.ARROWS}
        height={14}
        width={14}
        color={COLORS.TEXT_PRIMARY}
      />
      <div className={cn('f-12-400 text-GRAY_700 pl-2', resetProps?.resetTextClassName)}>{resetProps?.resetText}</div>
    </div>
  );
};
