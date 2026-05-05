'use client';

import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft, ArrowRight, PanelLeft, PanelLeftClose } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { defaultFnType } from '@/types/commonTypes';

interface SidebarHeaderProps {
  isExpanded: boolean;
  onToggle: defaultFnType;
}

const SidebarHeader = ({ isExpanded, onToggle }: SidebarHeaderProps) => {
  const router = useRouter();

  if (!isExpanded) {
    return (
      <div className='flex shrink-0 justify-center px-1.5 pt-2'>
        <Button
          variant='ghost'
          size='icon'
          className='text-GRAY_600 hover:text-GRAY_900 hover:bg-accent h-8 w-8 rounded-lg p-1.5'
          onClick={onToggle}
          title='Expand sidebar'
        >
          <PanelLeft size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex shrink-0 items-center justify-between gap-x-1 px-3 pt-2')}>
      <div className='flex items-center'>
        <Button
          variant='ghost'
          size='icon'
          className='text-GRAY_600 hover:text-GRAY_900 hover:bg-accent h-8 w-8 rounded-lg p-1.5'
          onClick={() => router.back()}
          title='Back'
        >
          <ArrowLeft size={16} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='text-GRAY_600 hover:text-GRAY_900 hover:bg-accent h-8 w-8 rounded-lg p-1.5'
          onClick={() => router.forward()}
          title='Forward'
        >
          <ArrowRight size={16} />
        </Button>
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='text-GRAY_600 hover:text-GRAY_900 hover:bg-accent h-8 w-8 rounded-lg p-1.5'
        onClick={onToggle}
        title='Collapse sidebar'
      >
        <PanelLeftClose size={16} />
      </Button>
    </div>
  );
};

export default SidebarHeader;
