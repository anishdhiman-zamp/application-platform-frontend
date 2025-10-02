'use client';
import { type FC, ReactNode } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { useSearchParams } from 'next/navigation';

interface SheetLayoutProps {
  children: ReactNode;
  widget: ReactNode;
  sheetsTabs: React.ReactNode;
  createEditFilter: React.ReactNode;
}

const SheetLayout: FC<SheetLayoutProps> = ({ children, sheetsTabs, widget, createEditFilter }) => {
  const searchParams = useSearchParams();
  const isFilterOpen = searchParams?.get('isFilterOpen') === 'true';

  return (
    <div>
      {sheetsTabs}
      {widget}
      <div className='flex justify-between'>
        <div className={cn('transition-all', isFilterOpen ? 'w-[calc(100%-296px)]' : 'w-full')}>{children}</div>
        <div className={cn('transition-all', isFilterOpen ? 'w-74' : 'w-0')}>{createEditFilter}</div>
      </div>
    </div>
  );
};

export default SheetLayout;
