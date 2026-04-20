'use client';

import { cn } from '@zamp-platform/ui/utils';
import { Folders } from 'lucide-react';
import { FC } from 'react';

export interface DropOverlayProps {
  isVisible: boolean;
  title?: string;
  className?: string;
}

export const DropOverlay: FC<DropOverlayProps> = ({
  isVisible,
  title = 'Drop your files here to upload to chat',
  className,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'bg-BG_WHITE/80 pointer-events-none absolute inset-0 z-100 flex items-center justify-center backdrop-blur-[4px]',
        className,
      )}
    >
      <div className='flex flex-col items-center gap-3'>
        <Folders />
        <p className='f-14-550 text-GRAY_1000'>{title}</p>
      </div>
    </div>
  );
};

export default DropOverlay;
