'use client';

import { FC, useMemo, useRef, useState } from 'react';
import { useOnClickOutside } from 'hooks';
import { useAppDispatch } from 'hooks/toolkit';
import Link from 'next/link';
import { BreadcrumbItem, resetBreadcrumb } from 'store/slices/layout-configs';
import { cn } from 'utils/common';
import { MenuWrapper } from 'components/common/MenuWrapper';

interface BreadCrumbProps {
  breadcrumbStack: BreadcrumbItem[];
}

const BreadCrumb: FC<BreadCrumbProps> = ({ breadcrumbStack = [] }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const appDispatch = useAppDispatch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  const { firstBreadCrumb, lastTwoBreadCrumbs, middleBreadCrumbs } = useMemo(() => {
    if (!breadcrumbStack?.length)
      return {
        firstBreadCrumb: { href: '', title: '' },
        lastTwoBreadCrumbs: [],
        middleBreadCrumbs: [],
      };

    return {
      firstBreadCrumb: breadcrumbStack[0],
      lastTwoBreadCrumbs:
        breadcrumbStack?.length === 2
          ? breadcrumbStack.slice(-1)
          : breadcrumbStack?.length >= 2
            ? breadcrumbStack.slice(-2)
            : [],
      middleBreadCrumbs: breadcrumbStack?.length > 3 ? breadcrumbStack.slice(1, -2) : [],
    };
  }, [breadcrumbStack]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleBreadcrumbClick = (index: number) => {
    appDispatch(resetBreadcrumb(breadcrumbStack.slice(0, index + 1)));
  };

  return (
    <div className='f-13-400 text-GRAY_700 flex items-center gap-1'>
      {firstBreadCrumb && (
        <Link
          href={firstBreadCrumb.href ?? ''}
          className={cn({ 'f-13-500 text-GRAY_1000': !lastTwoBreadCrumbs?.length })}
          onClick={() => handleBreadcrumbClick(0)}
        >
          {`${firstBreadCrumb.title}`}
        </Link>
      )}
      {lastTwoBreadCrumbs?.length > 0 && <div>/</div>}
      {middleBreadCrumbs?.length > 0 && (
        <div className='group relative flex cursor-pointer items-center gap-1' ref={menuRef}>
          <div className='group-hover:text-GRAY_1000' onClick={toggleMenu}>
            ...
          </div>
          <div>/</div>
          {isMenuOpen && (
            <MenuWrapper
              id='breadcrumb-menu'
              className='absolute! z-100 top-4 mt-2 p-1'
              childrenWrapperClassName='overflow-y-auto!'
            >
              {middleBreadCrumbs?.map((item, index) => (
                <Link
                  key={`${item.title}-${index}`}
                  className='hover:bg-GRAY_200 f-12-500 cursor-pointer text-nowrap rounded-md px-2.5 py-2'
                  href={item.href ?? ''}
                  onClick={() => handleBreadcrumbClick(breadcrumbStack.indexOf(item))}
                >
                  {item.title}
                </Link>
              ))}
            </MenuWrapper>
          )}
        </div>
      )}
      {lastTwoBreadCrumbs?.map((item, index) => (
        <Link
          key={`${item.title}-${index}`}
          href={item.href ?? ''}
          className={cn({ 'f-13-500 text-GRAY_1000': index == lastTwoBreadCrumbs?.length - 1 })}
          onClick={() => handleBreadcrumbClick(breadcrumbStack.indexOf(item))}
        >
          {`${item.title}${index < lastTwoBreadCrumbs?.length - 1 ? ' / ' : ''}`}
        </Link>
      ))}
    </div>
  );
};

export default BreadCrumb;
