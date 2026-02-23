'use client';

import { Button, FileIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import TooltipV2 from '@/components/common/TooltipV2';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { DYNAMIC_TAB_ICON_MAP } from '@/modules/pace/pace.constants';
import { DynamicTab, DynamicTabType } from '@/modules/pace/pace.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';

export interface DynamicTabItemProps {
  tab: DynamicTab;
  isActive: boolean;
  isDragging?: boolean;
  onClose: (e: React.MouseEvent, id: string) => void;
}

const DynamicTabItem = ({ tab, isActive, isDragging = false, onClose }: DynamicTabItemProps) => {
  const Icon = DYNAMIC_TAB_ICON_MAP[tab.type];
  const isFileTab = tab.type === DynamicTabType.FILE;
  const fileExtension = isFileTab ? getFileExtension(tab.name) : null;

  return (
    <TooltipV2
      tooltipBody={tab.name}
      side={SIDE_OPTIONS.BOTTOM}
      delayDuration={500}
      asChildTrigger
      disabled={isDragging}
    >
      <Link
        href={tab.path}
        className={cn(
          'group relative flex h-[30px] w-full min-w-[48px] cursor-pointer items-center gap-x-2 rounded-[8px] border p-2 transition-all duration-150 ease-in-out',
          isActive
            ? 'border-GRAY_300 text-GRAY_1000 bg-white hover:bg-white'
            : 'text-GRAY_700 hover:text-GRAY_1000 hover:bg-GRAY_200 border-transparent',
        )}
      >
        {isFileTab ? (
          <FileIcon extension={fileExtension || 'txt'} size='xs' />
        ) : (
          <Icon size={14} className='shrink-0' />
        )}
        <span className='f-11-500 min-w-0 flex-1 truncate'>{tab.name}</span>
        <Button
          id='dynamic-tab-close-button'
          variant='ghost'
          size='xxsmall'
          onClick={(e) => onClose(e, tab.id)}
          className='ml-0.5 h-4 w-4 shrink-0 p-0 opacity-0 group-hover:opacity-100'
        >
          <X size={12} className='text-GRAY_700' />
        </Button>
      </Link>
    </TooltipV2>
  );
};

export default DynamicTabItem;
