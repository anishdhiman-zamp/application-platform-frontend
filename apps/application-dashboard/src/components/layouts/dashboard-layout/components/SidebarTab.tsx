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
        'f-14-300 flex h-8 w-full items-center gap-2.5 overflow-hidden rounded-md px-2.5',
        isSelected ? 'bg-GRAY_100 text-GRAY_1000' : 'text-GRAY_900 hover:bg-GRAY_20',
        className,
      )}
      role='presentation'
    >
      {icon}
      {iconId && <SvgSpriteLoader id={iconId} size={14} className='min-w-4' color={iconColor} />}
      <div className='f-13-500 truncate whitespace-nowrap select-none'>{name}</div>
    </div>
  );
};

export default memo(SidebarTab);
