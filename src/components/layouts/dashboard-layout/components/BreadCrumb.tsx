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
    <div className='flex items-center f-13-400 text-GRAY_700 gap-1'>
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
        <div className='flex items-center gap-1 group cursor-pointer relative' ref={menuRef}>
          <div className='group-hover:text-GRAY_1000' onClick={toggleMenu}>
            ...
          </div>
          <div>/</div>
          {isMenuOpen && (
            <MenuWrapper
              id='breadcrumb-menu'
              className='!absolute z-[100] p-1 top-4 mt-2'
              childrenWrapperClassName='!overflow-y-auto'
            >
              {middleBreadCrumbs?.map((item) => (
                <Link
                  key={item.title}
                  className='hover:bg-GRAY_200 rounded-md py-2 px-2.5 f-12-500 cursor-pointer text-nowrap'
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
          key={item.title}
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
