import React from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import { defaultFnType } from 'types/commonTypes';
import { cn } from 'utils/common';

interface WorkspaceTabProps {
  label: string;
  isSelected?: boolean;
  onClick?: defaultFnType;
  className?: string;
  color?: string;
}

const WorkspaceTab = ({ label, isSelected, onClick, className, color }: WorkspaceTabProps) => {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={cn(
        'f-13-500 flex cursor-pointer items-center gap-1 rounded-md px-2 py-2.5 select-none',
        onClick ? 'hover:bg-GRAY_20' : '',
        isSelected ? 'bg-GRAY_100' : '',
        className,
      )}
    >
      <div
        className={cn('f-9-600 mr-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-sm text-white')}
        style={{ backgroundColor: color }}
      >
        {label.charAt(0).toUpperCase()}
      </div>
      <div className='flex-1'>{label}</div>
      {isSelected && (
        <SvgSpriteLoader
          id='check'
          iconCategory={ICON_SPRITE_TYPES.GENERAL}
          width={14}
          height={14}
          className='float-right min-w-4'
        />
      )}
    </div>
  );
};

export default WorkspaceTab;
