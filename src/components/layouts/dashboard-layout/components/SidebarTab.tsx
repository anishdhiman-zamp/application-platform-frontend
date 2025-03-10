import React, { memo, ReactNode } from 'react';
import Link from 'next/link';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type SidebarTabProps = {
  isSelected: boolean;
  iconId?: string;
  iconColor?: string;
  name: string;
  isNew?: boolean;
  expanded?: boolean;
  shortcutLabel?: string[];
  className?: string;
  icon?: ReactNode;
  path: string;
};

const SidebarTab: React.FC<SidebarTabProps> = ({
  isSelected,
  iconId,
  iconColor,
  name,
  expanded = true,
  className = '',
  icon = null,
  path,
}) => {
  return (
    <Link href={path}>
      <div className='group/nav relative'>
        <div
          className={`rounded-md overflow-hidden cursor-pointer h-8 w-full ${className} px-2.5 f-14-300 flex gap-2.5 items-center ${
            isSelected ? 'bg-GRAY_100 text-GRAY_1000' : 'text-GRAY_900 hover:bg-GRAY_20'
          } ${expanded ? 'w-[176px]' : 'w-[34px]'}`}
          role='presentation'
        >
          {icon}
          {iconId && <SvgSpriteLoader id={iconId} size={14} className='min-w-4' color={iconColor} />}
          <div className='whitespace-nowrap select-none f-13-500 truncate'>{name}</div>
        </div>
      </div>
    </Link>
  );
};

export default memo(SidebarTab);
