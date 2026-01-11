import { useCallback, useMemo } from 'react';
import { captureException } from '@sentry/browser';
import { parseIntSafely } from 'modules/process/process.utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetActivityRunsQuery, useLazyGetActivityRunsQuery } from '@/apis/processes';
import { PAGE_SIZE } from '@/components/common/table/table.constants';
import { getEncodedRequest } from '@/components/common/table/table.utils';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';
import { MapAny } from '@/types/commonTypes';

export const useActivityNavigation = (processId: string) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlIndex = parseIntSafely(searchParams?.get('currentIndex'), -1);
  const urlTotal = parseIntSafely(searchParams?.get('totalRows'), 0);
  const status = searchParams?.get('status');
  const filterContext = searchParams?.get('filterContext');

  const filters = useMemo(() => {
    let decoded = {};

    try {
      decoded = filterContext ? JSON.parse(decodeURIComponent(filterContext)) : {};
    } catch (error) {
      decoded = {};
      captureException(error);
    }

    return {
      ...decoded,
      ...(status && {
        status: {
          filterType: FILTER_TYPES.MULTI_SELECT,
          type: CONDITION_OPERATOR_TYPE.CONTAINS,
          values: [status],
        },
      }),
    };
  }, [filterContext, status]);

  const currentPage = useMemo(() => {
    return urlIndex !== -1 ? Math.floor(urlIndex / PAGE_SIZE) + 1 : 1;
  }, [urlIndex]);

  const encodedQueryConfig = useMemo(() => {
    const baseRequest = {
      startRow: 0,
      endRow: PAGE_SIZE,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      sortModel: [],
      filterModel: filters,
    };

    return JSON.parse(getEncodedRequest(baseRequest));
  }, [filters]);

  const { data: initialData, isLoading: isInitialLoading } = useGetActivityRunsQuery(
    {
      processId,
      query_config: JSON.stringify({
        ...encodedQueryConfig,
        pagination: { page: currentPage, page_size: PAGE_SIZE },
      }),
    },
    {
      skip: urlIndex === -1 || urlTotal === 0,
      refetchOnMountOrArgChange: false,
    },
  );
  const [triggerFetchPage, { isLoading: isLoadingOtherPage }] = useLazyGetActivityRunsQuery();

  const fetchPageRows = useCallback(
    async (pageNumber: number): Promise<MapAny[]> => {
      try {
        const { data } = await triggerFetchPage({
          processId,
          query_config: JSON.stringify({
            ...encodedQueryConfig,
            pagination: { page: pageNumber, page_size: PAGE_SIZE },
          }),
        });

        return data?.rows || [];
      } catch (err) {
        captureException(err);

        return [];
      }
    },
    [processId, encodedQueryConfig],
  );

  const navigateToActivity = useCallback(
    async (direction: 'next' | 'previous') => {
      const currentIndex = urlIndex;
      const totalCount = urlTotal;
      const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

      if (targetIndex < 0 || targetIndex >= totalCount) return;

      const currentPageStart = Math.floor(currentIndex / PAGE_SIZE) * PAGE_SIZE;
      const isSamePage = targetIndex >= currentPageStart && targetIndex < currentPageStart + PAGE_SIZE;
      const indexInPage = targetIndex % PAGE_SIZE;

      let rows: MapAny[] = [];

      if (isSamePage && initialData?.rows?.length) {
        rows = initialData.rows;
      } else {
        rows = await fetchPageRows(Math.floor(targetIndex / PAGE_SIZE) + 1);
      }

      const targetActivity = rows[indexInPage];

      if (!targetActivity) return;

      const route = getProcessActivityLogsRouteById(
        processId,
        targetActivity.id,
        status || undefined,
        encodeURIComponent(JSON.stringify(filters || {})),
        targetIndex,
        totalCount,
      );

      router.replace(route);
    },
    [initialData, filters, router, processId, status, urlIndex, urlTotal],
  );

  return {
    currentIndex: urlIndex,
    totalCount: urlTotal,
    hasNext: urlIndex < urlTotal - 1,
    hasPrevious: urlIndex > 0,
    isLoading: isInitialLoading || isLoadingOtherPage,
    goToNextActivity: () => navigateToActivity('next'),
    goToPreviousActivity: () => navigateToActivity('previous'),
  };
};
