import React, { FC, memo, ReactNode } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from 'utils/common';

type SidebarTabProps = {
  isSelected?: boolean;
  iconId?: string;
  iconColor?: string;
  name: string;
  isNew?: boolean;
  shortcutLabel?: string[];
  className?: string;
  icon?: ReactNode;
};

const SidebarTab: FC<SidebarTabProps> = ({ isSelected, iconId, iconColor, name, className = '', icon = null }) => {
  return (
    <div
      className={cn(
        'rounded-md overflow-hidden h-8 w-full px-2.5 f-14-300 flex gap-2.5 items-center',
        isSelected ? 'bg-GRAY_100 text-GRAY_1000' : 'text-GRAY_900 hover:bg-GRAY_20',
        className,
      )}
      role='presentation'
    >
      {icon}
      {iconId && <SvgSpriteLoader id={iconId} size={14} className='min-w-4' color={iconColor} />}
      <div className='whitespace-nowrap select-none f-13-500 truncate'>{name}</div>
    </div>
  );
};

export default memo(SidebarTab);
