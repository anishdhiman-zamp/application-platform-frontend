'use client';

import { FC, useMemo, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetPagesQuery, useGetProcessesQuery } from 'apis/pages';
import {
  getDatasetRouteById,
  getPageDatasetRoute,
  getPageRouteById,
  getProcessActivityLogsRouteById,
  getProcessRouteById,
  ROUTES_PATH,
} from 'constants/routeConfig';
import { useOnClickOutside } from 'hooks';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BreadcrumbItem } from 'store/slices/layout-configs';
import { capitalizeFirstLetter, cn } from 'utils/common';
import { useGetAllDatasetsQuery } from '@/apis/admin';
import { MODULE_TYPE } from '@/types/commonTypes';
import { MenuWrapper } from 'components/common/MenuWrapper';

interface BreadCrumbProps {
  isSidebarOpen: boolean;
}

const BreadCrumb: FC<BreadCrumbProps> = ({ isSidebarOpen }) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const params = useParams();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: datasets } = useGetAllDatasetsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: processes } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const breadcrumbStack = useMemo(() => {
    const breadcrumbStack = [];

    switch (pathname?.split('/')[1]) {
      case MODULE_TYPE.PAGES:
        {
          const pageId = params?.pageId;
          const currentPageTitle = pages?.find((page) => page?.page_id === pageId)?.name ?? '';
          const datasetId = params?.datasetId;

          const query: Record<string, string> = Object.fromEntries(searchParams?.entries() ?? []);

          breadcrumbStack.push({ title: currentPageTitle, href: getPageRouteById(pageId as string) });
          if (datasetId) {
            const datasetTitle = datasets?.datasets.find((dataset) => dataset?.ID === datasetId)?.Title ?? '';

            breadcrumbStack.push({
              title: datasetTitle,
              href: getPageDatasetRoute(pageId as string, datasetId as string, query),
            });
          }
        }
        break;
      case MODULE_TYPE.PROCESSES:
        {
          const activityId = params?.activityId;
          const processId = params?.processId as string;
          const status = searchParams?.get('status') as string;
          const currentProcessTitle = processes?.find((process) => process?.id === processId)?.display_name ?? '';

          breadcrumbStack.push({
            title: currentProcessTitle,
            href: getProcessRouteById(processId as string, status as string),
          });
          if (activityId) {
            breadcrumbStack.push({
              title: 'Activity Logs',
              href: getProcessActivityLogsRouteById(processId as string, activityId as string, status as string),
            });
          }
        }
        break;
      case MODULE_TYPE.DATASETS:
        {
          const datasetId = params?.datasetId;

          breadcrumbStack.push({ title: 'Data', href: ROUTES_PATH.DATA });
          if (datasetId) {
            const datasetTitle = datasets?.datasets.find((dataset) => dataset?.ID === datasetId)?.Title ?? '';

            breadcrumbStack.push({
              title: datasetTitle,
              href: getDatasetRouteById(datasetId as string),
            });
          }
        }
        break;
      default:
        {
          breadcrumbStack.push({
            title: capitalizeFirstLetter(pathname?.split('/')[1] ?? ''),
            href: pathname,
          });
        }
        break;
    }

    return breadcrumbStack as BreadcrumbItem[];
  }, [pathname, searchParams?.toString(), pages, datasets, processes]);

  const handleBreadcrumbClick = (link: string, index?: number) => {
    if (index === 0) router.back();
    else router.replace(link);
  };

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

  return (
    <div
      className={cn('bg-BACKGROUND_GRAY_1 z-1000 flex h-full w-full items-center gap-2 transition-all', {
        'pl-1': breadcrumbStack?.length <= 1 && isSidebarOpen,
      })}
    >
      {breadcrumbStack?.length > 1 && (
        <SvgSpriteLoader
          id='arrow-left'
          height={16}
          width={16}
          onClick={() => router.back()}
          className='cursor-pointer'
        />
      )}
      <div className='f-13-400 text-GRAY_700 flex items-center gap-1'>
        {firstBreadCrumb && (
          <button
            className={cn({ 'f-13-500 text-GRAY_1000': !lastTwoBreadCrumbs?.length }, 'cursor-pointer')}
            onClick={() => handleBreadcrumbClick(firstBreadCrumb.href ?? '')}
          >
            {`${firstBreadCrumb.title}`}
          </button>
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
                className='absolute! top-4 z-100 mt-2 p-1'
                childrenWrapperClassName='overflow-y-auto!'
              >
                {middleBreadCrumbs?.map((item, index) => (
                  <button
                    key={`${item.title}-${index}`}
                    className='hover:bg-GRAY_200 f-12-500 cursor-pointer rounded-md px-2.5 py-2 text-nowrap'
                    onClick={() => handleBreadcrumbClick(item.href ?? '')}
                  >
                    {item.title}
                  </button>
                ))}
              </MenuWrapper>
            )}
          </div>
        )}
        {lastTwoBreadCrumbs?.map((item, index) => (
          <button
            key={`${item.title}-${index}`}
            className={cn('cursor-pointer', {
              'f-13-500 text-GRAY_1000 !cursor-default': index == lastTwoBreadCrumbs?.length - 1,
            })}
            onClick={() => index !== lastTwoBreadCrumbs?.length - 1 && handleBreadcrumbClick(item.href ?? '', index)}
          >
            {`${item.title}${index < lastTwoBreadCrumbs?.length - 1 ? ' / ' : ''}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BreadCrumb;
