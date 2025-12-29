'use client';

import { FC, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetPagesQuery, useGetProcessesQuery } from 'apis/pages';
import {
  getDatasetRouteById,
  getKnowledgeBasedRouteByProcessId,
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
import TooltipV2 from '@/components/common/TooltipV2';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import useIsEditingBreadcrumbAllowed from '@/hooks/useIsEditingBreadcrumbAllowed';
import useUpdateBreadcrumb from '@/hooks/useUpdateBreadcrumb';
import { MODULE_TYPE, SIDE_OPTIONS } from '@/types/commonTypes';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState<string>();

  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: datasets } = useGetAllDatasetsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: processes } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

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
      case MODULE_TYPE.PROCESS:
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
          if (pathname.includes(getKnowledgeBasedRouteByProcessId(processId as string))) {
            breadcrumbStack.push({
              title: 'Knowledge Base',
              href: getKnowledgeBasedRouteByProcessId(processId as string),
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

  const { firstBreadCrumb, middleBreadCrumbs, secondLastBreadCrumb, lastBreadCrumb } = useMemo(() => {
    const breadcrumbStackLength = breadcrumbStack?.length;

    if (!breadcrumbStackLength)
      return {
        firstBreadCrumb: { href: '', title: '' },
        middleBreadCrumbs: [],
      };

    return {
      firstBreadCrumb: breadcrumbStackLength > 1 ? breadcrumbStack[0] : null,
      secondLastBreadCrumb: breadcrumbStackLength > 2 ? breadcrumbStack[breadcrumbStackLength - 2] : null,
      lastBreadCrumb: breadcrumbStack[breadcrumbStackLength - 1],
      middleBreadCrumbs: breadcrumbStackLength > 3 ? breadcrumbStack.slice(1, -2) : [],
    };
  }, [breadcrumbStack]);

  const isEditingBreadcrumbAllowed = useIsEditingBreadcrumbAllowed();

  const updateBreadcrumb = useUpdateBreadcrumb({
    setIsEditing,
    setEditedName,
    lastBreadCrumbTitle: lastBreadCrumb?.title ?? '',
  });

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleBreadcrumbClick = (link: string, index?: number) => {
    if (index === 0) router.back();
    else router.replace(link);
  };

  const handleLastBreadCrumbClick = () => {
    setIsEditing(true);
  };

  const handleEditBlur = () => {
    const trimmedName = editedName?.trim();

    if (!trimmedName || trimmedName === lastBreadCrumb?.title) {
      setIsEditing(false);
      setEditedName(lastBreadCrumb?.title ?? '');

      return;
    }
    updateBreadcrumb(trimmedName);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      e.stopPropagation();

      handleEditBlur();
    }
  };

  useEffect(() => {
    if (params && lastBreadCrumb) setEditedName(lastBreadCrumb?.title ?? '');
  }, [lastBreadCrumb, params]);

  return (
    <div
      className={cn('bg-BACKGROUND_GRAY_1 z-1000 flex h-full items-center gap-2 transition-all', {
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
            className={cn({ 'f-13-500 text-GRAY_1000': !lastBreadCrumb }, 'cursor-pointer')}
            onClick={() => handleBreadcrumbClick(firstBreadCrumb.href ?? '')}
          >
            {`${firstBreadCrumb.title} ${lastBreadCrumb ? '/' : ''}`}
          </button>
        )}
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
        {secondLastBreadCrumb && (
          <button className='cursor-pointer' onClick={() => handleBreadcrumbClick(secondLastBreadCrumb.href ?? '')}>
            {`${secondLastBreadCrumb.title}`}
          </button>
        )}
        {lastBreadCrumb &&
          (isEditingBreadcrumbAllowed ? (
            <>
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  size='small'
                  className='text-gray-1000'
                  onBlur={handleEditBlur}
                  autoFocus
                  onKeyDown={handleEditKeyDown}
                  data-testid='breadcrumb-edit-input'
                />
              ) : (
                <TooltipV2 tooltipBody='Rename' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
                  <Button
                    variant='ghost'
                    size='xsmall'
                    className='h-6 p-1'
                    onClick={handleLastBreadCrumbClick}
                    data-testid='breadcrumb-edit-btn'
                  >
                    <span className='f-13-500 text-gray-1000'>{editedName}</span>
                  </Button>
                </TooltipV2>
              )}
            </>
          ) : (
            <div className='f-13-500 text-GRAY_1000'>{lastBreadCrumb.title}</div>
          ))}
      </div>
    </div>
  );
};

export default BreadCrumb;
