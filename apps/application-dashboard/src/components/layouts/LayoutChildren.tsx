'use client';

import {
  Children,
  cloneElement,
  FC,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAppSelector } from 'hooks/toolkit';
import { usePathname } from 'next/navigation';
import { RootState } from 'store';
import { CommonPageLayoutProps } from 'types/commonTypes';
import { cn } from 'utils/common';

const LayoutChildren: FC<{ children: ReactNode; showTopbar: boolean }> = ({ children, showTopbar }) => {
  const pathname = usePathname() || '/';
  const containerRef = useRef<HTMLDivElement>(null);
  const [previousRoute, setPreviousRoute] = useState<string>(pathname);
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);

  useEffect(() => {
    if (previousRoute === pathname) return;
    setPreviousRoute(pathname);
    scrollToTop();
  }, [pathname, previousRoute]);

  const scrollToTop = () => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  const renderChildrenWithProps = (children: ReactNode) => {
    const childrenWithProps = Children.map(children, (child) => {
      if (isValidElement(child))
        return cloneElement(child as ReactElement<CommonPageLayoutProps>, {
          scrollToTop: scrollToTop,
          rootContainerRef: containerRef as React.RefObject<HTMLDivElement>,
        });

      return child;
    });

    return childrenWithProps;
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative flex h-screen grow flex-col', {
        'h-full': !showTopbar,
      })}
    >
      <div
        className={cn(
          'border-GRAY_400 relative mx-auto w-full border bg-white',
          showTopbar ? 'h-[calc(100vh-48px)]' : 'h-screen',
          isSidebarOpen && showTopbar && 'rounded-tl-xl',
        )}
      >
        {renderChildrenWithProps(children)}
      </div>
    </div>
  );
};

export default LayoutChildren;
