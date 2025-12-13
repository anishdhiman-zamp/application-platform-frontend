'use client';

import { type FC, ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { useSearchParams } from 'next/navigation';

interface SheetLayoutContentProps {
  children: ReactNode;
  createEditFilter: React.ReactNode;
}

const SheetLayoutContent: FC<SheetLayoutContentProps> = ({ children, createEditFilter }) => {
  const searchParams = useSearchParams();
  const isFilterOpen = searchParams?.get('isFilterOpen') === 'true';

  return (
    <div className='flex h-full justify-between'>
      <div className={cn('h-full transition-all', isFilterOpen ? 'w-[calc(100%-296px)]' : 'w-full')}>{children}</div>
      <div className={cn('h-full transition-all', isFilterOpen ? 'w-74' : 'w-0')}>{createEditFilter}</div>
    </div>
  );
};

export default SheetLayoutContent;
