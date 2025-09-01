import { type FC, ReactNode } from 'react';

interface SheetLayoutProps {
  children: ReactNode;
  widget: ReactNode;
  sheetsTabs: React.ReactNode;
}

const SheetLayout: FC<SheetLayoutProps> = ({ children, sheetsTabs, widget }) => {
  return (
    <div>
      {widget}
      {sheetsTabs}
      {children}
    </div>
  );
};

export default SheetLayout;
