import { FC, ReactNode } from 'react';
import Sidebar from 'components/layouts/dashboard-layout/Sidebar';
import Topbar from 'components/layouts/dashboard-layout/topbar/TopBar';
import LayoutChildren from 'components/layouts/LayoutChildren';

const LayoutWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className='bg-BACKGROUND_GRAY_1 relative'>
      <Topbar />
      <div className={`relative flex h-[calc(100vh-48px)] w-full min-w-[768px]`}>
        <Sidebar />
        <LayoutChildren>{children}</LayoutChildren>
      </div>
    </div>
  );
};

export default LayoutWrapper;
