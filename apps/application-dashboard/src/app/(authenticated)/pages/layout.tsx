'use client';
import { type FC, ReactNode, Suspense } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { useSearchParams } from 'next/navigation';

interface SheetLayoutProps {
  children: ReactNode;
  widget: ReactNode;
  sheetsTabs: React.ReactNode;
  createEditFilter: React.ReactNode;
}

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

const SheetLayout: FC<SheetLayoutProps> = ({ children, sheetsTabs, widget, createEditFilter }) => {
  return (
    <div className='h-full w-full'>
      {sheetsTabs}
      {widget}
      <Suspense>
        <SheetLayoutContent createEditFilter={createEditFilter}>{children}</SheetLayoutContent>
      </Suspense>
    </div>
  );
};

export default SheetLayout;
