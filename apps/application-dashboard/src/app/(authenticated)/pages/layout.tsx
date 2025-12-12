import { type FC, ReactNode, Suspense } from 'react';
import SheetLayoutContent from 'app/(authenticated)/pages/SheetLayoutContent';

interface SheetLayoutProps {
  children: ReactNode;
  widget: ReactNode;
  sheetsTabs: React.ReactNode;
  createEditFilter: React.ReactNode;
}

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
