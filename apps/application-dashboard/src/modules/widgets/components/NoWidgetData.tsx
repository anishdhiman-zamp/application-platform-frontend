import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { cn } from 'utils/common';

interface NoWidgetDataProps {
  className?: string;
  text?: string;
}

const NoWidgetData: FC<NoWidgetDataProps> = ({ className, text }) => {
  return (
    <div className={cn('z-1000 right-0 top-0 flex h-full w-full items-center justify-center bg-white', className)}>
      <div className='flex flex-col items-center gap-3'>
        <SvgSpriteLoader
          id='coins-stacked-03'
          iconCategory={ICON_SPRITE_TYPES.FINANCE_AND_ECOMMERCE}
          width={24}
          height={24}
          color={COLORS.GRAY_700}
        />
        <div className='text-GRAY_700 f-12-450'>{text || 'No data available, try again with different filters'}</div>
      </div>
    </div>
  );
};

export default NoWidgetData;
