import React, { Children, cloneElement, FC, isValidElement, ReactNode, useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { useAppDispatch } from 'hooks/toolkit';
import { useRouter } from 'next/router';
import { store } from 'store';
import { setUserInfo } from 'store/slices/user';
import { CommonPageLayoutProps } from 'types/commonTypes';
import Sidebar from 'components/layouts/dashboard-layout/Sidebar';
import Topbar from 'components/layouts/dashboard-layout/TopBar';

type DashboardLayoutProps = {
  pageType?: string;
  children: React.ReactNode;
  containerStyle?: string;
  contentWrapperClassName?: string;
};

const DashboardLayout: FC<DashboardLayoutProps> = ({ children, containerStyle, contentWrapperClassName = '' }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const previousRoute = useRef<string>('');

  useEffect(() => {
    if (previousRoute.current === router.pathname) return;

    previousRoute.current = router.pathname;
    scrollToTop();
  }, [router]);

  const scrollToTop = () => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  const renderChildrenWithProps = (children: ReactNode) => {
    const childrenWithProps = Children.map(children, (child) => {
      if (isValidElement(child))
        return cloneElement(child as React.ReactElement<CommonPageLayoutProps>, {
          scrollToTop: scrollToTop,
          rootContainerRef: containerRef,
        });

      return child;
    });

    return childrenWithProps;
  };

  useEffect(() => {
    dispatch(setUserInfo({ name: 'Siddharth' }));
  }, []);

  return (
    <Provider store={store}>
      <div className='bg-BACKGROUND_GRAY_1'>
        <Topbar isSidebarOpen={isSidebarOpen} onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <div className={`w-full min-w-[768px] flex relative h-[calc(100vh-48px)]`}>
          <Sidebar isSidebarOpen={isSidebarOpen} />
          <div
            ref={containerRef}
            className={`flex flex-col flex-grow relative h-screen ${containerStyle}`}
          >
            <div className={`w-full relative mx-auto border border-GRAY_400 bg-white h-full rounded-tl-md ${contentWrapperClassName}`}>
              {renderChildrenWithProps(children)}
            </div>
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default DashboardLayout;
