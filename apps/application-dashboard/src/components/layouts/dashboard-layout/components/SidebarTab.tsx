import { FC, memo } from 'react';
import Image from 'next/image';
import { cn } from 'utils/common';

type SidebarTabProps = {
  name: string;
  iconUrl: string;
  isSelected?: boolean;
  className?: string;
};

const SidebarTab: FC<SidebarTabProps> = ({ isSelected, iconUrl, name, className = '' }) => {
  return (
    <div
      className={cn(
        'f-14-300 flex h-8 w-full items-center gap-2.5 overflow-hidden rounded-md px-2.5',
        isSelected ? 'bg-GRAY_100 text-GRAY_1000' : 'text-GRAY_900 hover:bg-GRAY_20',
        className,
      )}
      role='presentation'
    >
      <Image src={iconUrl} alt={name} priority height={14} width={14} className='min-w-4' />
      <div className='f-13-500 truncate whitespace-nowrap select-none'>{name}</div>
    </div>
  );
};

export default memo(SidebarTab);
