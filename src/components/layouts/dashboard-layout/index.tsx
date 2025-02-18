import React, {
  Children,
  cloneElement,
  FC,
  isValidElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState, store } from 'store';
import { setDashboardLoader } from 'store/slices/user';
import { CommonPageLayoutProps, DashboardLayoutProps } from 'types/commonTypes';
import DashboardLoader from 'components/common/loader/DashboardLoader';
import {
  fadeOutOffsetTimeDifference,
  minLoaderDuration,
} from 'components/layouts/dashboard-layout/dashboardLayout.constants';
import Sidebar from 'components/layouts/dashboard-layout/Sidebar';
import Topbar from 'components/layouts/dashboard-layout/topbar/TopBar';

const DashboardLayout: FC<DashboardLayoutProps> = ({ children, containerStyle, contentWrapperClassName = '' }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousRoute = useRef<string>(router.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFadingOutEffect, setIsFadingOutEffect] = useState(false);
  const showDashboardLoader = useSelector((state: RootState) => state.user.dashboardLoader);

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

  const hideLoader = useCallback(() => {
    setIsFadingOutEffect(true);
    setTimeout(() => {
      dispatch(setDashboardLoader(false));
      setIsSidebarOpen(true);
    }, fadeOutOffsetTimeDifference);
  }, [dispatch, setIsSidebarOpen]);

  useEffect(() => {
    if (showDashboardLoader) {
      setIsFadingOutEffect(false);

      const fadeTimeout = setTimeout(() => setIsFadingOutEffect(true), minLoaderDuration - fadeOutOffsetTimeDifference);
      const hideTimeout = setTimeout(hideLoader, minLoaderDuration);

      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(hideTimeout);
      };
    }
  }, [showDashboardLoader, hideLoader]);

  return (
    <Provider store={store}>
      <div className='bg-BACKGROUND_GRAY_1 relative'>
        <Topbar isSidebarOpen={isSidebarOpen} onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <div className={`w-full min-w-[768px] flex relative h-[calc(100vh-48px)]`}>
          <Sidebar isSidebarOpen={isSidebarOpen} />
          <div ref={containerRef} className={`flex flex-col flex-grow relative h-screen ${containerStyle}`}>
            <div
              className={`w-full relative mx-auto border border-GRAY_400 bg-white h-[calc(100vh-48px)] rounded-tl-xl ${contentWrapperClassName}`}
            >
              {renderChildrenWithProps(children)}
            </div>
          </div>
        </div>

        {showDashboardLoader && <DashboardLoader isFadingOut={isFadingOutEffect} />}
      </div>
    </Provider>
  );
};

export default DashboardLayout;
