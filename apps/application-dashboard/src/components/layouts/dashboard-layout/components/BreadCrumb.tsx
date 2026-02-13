'use client';

import { FC, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetPagesQuery } from 'apis/pages';
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
import { usePendingDatasetContext } from '@/context/pendingDataset.context';
import useIsEditingBreadcrumbAllowed from '@/hooks/useIsEditingBreadcrumbAllowed';
import { usePagesAndProcessesData } from '@/hooks/usePagesAndProcessesData';
import useUpdateBreadcrumb from '@/hooks/useUpdateBreadcrumb';
import { UNTITLED_DATASET_NAME } from '@/modules/data/data.constants';
import { MODULE_TYPE, SIDE_OPTIONS } from '@/types/commonTypes';
import { MenuWrapper } from 'components/common/MenuWrapper';
import ProcessStatus from 'components/layouts/dashboard-layout/components/ProcessStatus';

interface BreadCrumbProps {
  isDraftProcess?: boolean;
}

const BreadCrumb: FC<BreadCrumbProps> = ({ isDraftProcess = false }) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const params = useParams();
  const pathname = usePathname();
  const { pendingTitle, shouldAutoFocusTitle, setShouldAutoFocusTitle } = usePendingDatasetContext() || {};

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState<string>();
  const prevDatasetIdRef = useRef<string | undefined>(undefined);

  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: datasets } = useGetAllDatasetsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { processes } = usePagesAndProcessesData();

  const currentProcess = useMemo(() => {
    if (pathname?.split('/')[1] === MODULE_TYPE.PROCESSES) {
      const processId = params?.processId as string;

      return processes?.find((process) => process?.process_id === processId);
    }

    return null;
  }, [pathname, params?.processId, processes]);

  // Track localStorage changes to force breadcrumb re-render
  const [localStorageVersion, setLocalStorageVersion] = useState(0);

  // Listen for localStorage changes (for dataset title updates)
  useEffect(() => {
    const handleStorageChange = () => {
      setLocalStorageVersion((prev) => prev + 1);
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (from same tab)
    window.addEventListener('localStorageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, []);

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
          const currentProcessTitle = currentProcess?.display_name ?? '';

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
          const datasetId = Array.isArray(params?.datasetId) ? params?.datasetId[0] : params?.datasetId;

          breadcrumbStack.push({ title: 'Data', href: ROUTES_PATH.DATA });
          if (datasetId && typeof datasetId === 'string' && datasetId.trim() !== '') {
            const existingDataset = datasets?.datasets.find((dataset) => dataset?.ID === datasetId);

            // Try to get title from localStorage first (highest priority, org-scoped)
            let localStorageTitle: string | null = null;

            try {
              const { getColumnConfigForDataset } = require('@zamp-platform/dataset-create-edit');
              const datasetData = getColumnConfigForDataset(datasetId as string);

              if (datasetData && typeof datasetData === 'object' && 'dataset_name' in datasetData) {
                const storedName = (datasetData as { dataset_name?: string }).dataset_name;

                // Only use storedName if it's not empty and not the same as datasetId (which is a fallback)
                if (storedName && storedName.trim() !== '' && storedName !== datasetId) {
                  localStorageTitle = storedName;
                }
              }
            } catch (error) {
              console.error('[BreadCrumb] Error reading from localStorage:', error);
            }

            // Priority: localStorage > API listing > pendingTitle > "Untitled Dataset"
            const datasetTitle = localStorageTitle || existingDataset?.Title || pendingTitle || UNTITLED_DATASET_NAME;

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
  }, [pathname, searchParams?.toString(), pages, datasets, processes, pendingTitle, localStorageVersion]);

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
    const currentDatasetId = params?.datasetId as string | undefined;
    const isDatasetPage = pathname?.split('/')[1] === MODULE_TYPE.DATASETS;

    // Only reset editedName when:
    // 1. We're not currently editing
    // 2. We navigated to a different dataset (dataset ID changed)
    // 3. Or it's the initial load (prevDatasetIdRef is undefined and we have a dataset ID)
    const datasetIdChanged = prevDatasetIdRef.current !== currentDatasetId;

    if (params && lastBreadCrumb && !isEditing) {
      if (isDatasetPage && datasetIdChanged) {
        // Dataset changed - reset to new breadcrumb title
        setEditedName(lastBreadCrumb?.title ?? '');
        prevDatasetIdRef.current = currentDatasetId;
      } else if (!isDatasetPage) {
        // Not a dataset page - always sync with breadcrumb
        setEditedName(lastBreadCrumb?.title ?? '');
      }
      // For dataset pages where dataset ID hasn't changed, don't reset
      // This preserves the user's input even after pendingTitle updates
    } else if (isDatasetPage && currentDatasetId) {
      // Update the ref even if we're editing, so we track the current dataset
      prevDatasetIdRef.current = currentDatasetId;
    }
  }, [lastBreadCrumb, params, isEditing, pathname]);

  // Auto-focus the title input when navigating to a dataset page with shouldAutoFocusTitle flag
  useEffect(() => {
    const isDatasetPage = pathname?.split('/')[1] === MODULE_TYPE.DATASETS && params?.datasetId;

    if (shouldAutoFocusTitle && isDatasetPage && isEditingBreadcrumbAllowed) {
      setIsEditing(true);
      setShouldAutoFocusTitle?.(false);
    }
  }, [shouldAutoFocusTitle, pathname, params?.datasetId, isEditingBreadcrumbAllowed, setShouldAutoFocusTitle]);

  const handleArrowClick = () => {
    const datasetId = Array.isArray(params?.datasetId) ? params?.datasetId[0] : params?.datasetId;

    // For dataset pages, use router.replace to go to datasets listing
    if (pathname?.split('/')[1] === MODULE_TYPE.DATASETS && datasetId) {
      router.replace(ROUTES_PATH.DATA);
    } else {
      router.back();
    }
  };

  return (
    <div className='bg-BACKGROUND_GRAY_1 z-1000 flex h-full min-w-0 flex-1 items-center gap-2 transition-all'>
      {breadcrumbStack?.length > 1 && (
        <div data-breadcrumb-arrow='true'>
          <SvgSpriteLoader
            id='arrow-left'
            height={16}
            width={16}
            onClick={handleArrowClick}
            className='cursor-pointer'
          />
        </div>
      )}
      <div className='f-13-400 text-GRAY_700 flex items-center gap-1'>
        {firstBreadCrumb && (
          <>
            <button
              className={cn({ 'f-13-500 text-GRAY_1000': !lastBreadCrumb }, 'cursor-pointer')}
              onClick={() => handleBreadcrumbClick(firstBreadCrumb.href ?? '')}
            >
              {firstBreadCrumb.title}
            </button>
            {isDraftProcess && <ProcessStatus status={currentProcess?.status} className='ml-1' />}
            {lastBreadCrumb && <span>/</span>}
          </>
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
          <>
            <button className='cursor-pointer' onClick={() => handleBreadcrumbClick(secondLastBreadCrumb.href ?? '')}>
              {`${secondLastBreadCrumb.title}`}
            </button>
            {isDraftProcess && <ProcessStatus status={currentProcess?.status} className='ml-1' />}
          </>
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
                  wrapperClassName='min-w-0 flex-1 max-w-[400px]'
                  onBlur={handleEditBlur}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onKeyDown={handleEditKeyDown}
                  data-testid='breadcrumb-edit-input'
                />
              ) : (
                <TooltipV2 tooltipBody='Rename' side={SIDE_OPTIONS.BOTTOM} asChildTrigger>
                  <Button
                    variant='ghost'
                    size='xsmall'
                    className='h-6 max-w-[400px] min-w-0 p-1'
                    onClick={handleLastBreadCrumbClick}
                    data-testid='breadcrumb-edit-btn'
                  >
                    <span className='f-13-500 text-gray-1000 truncate'>{editedName}</span>
                  </Button>
                </TooltipV2>
              )}
              {!firstBreadCrumb && isDraftProcess && <ProcessStatus status={currentProcess?.status} className='ml-1' />}
            </>
          ) : (
            <>
              <div className='f-13-500 text-GRAY_1000 max-w-[400px] truncate'>{lastBreadCrumb.title}</div>
              {!firstBreadCrumb && isDraftProcess && <ProcessStatus status={currentProcess?.status} className='ml-1' />}
            </>
          ))}
      </div>
    </div>
  );
};

export default BreadCrumb;
