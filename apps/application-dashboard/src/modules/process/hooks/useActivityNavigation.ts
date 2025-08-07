import { useCallback, useEffect, useMemo, useState } from 'react';
import { captureException } from '@sentry/browser';
import { parseIntSafely } from 'modules/process/process.utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLazyGetActivityRunsQuery } from '@/apis/processes';
import { PAGE_SIZE } from '@/components/common/table/table.constants';
import { getEncodedRequest } from '@/components/common/table/table.utils';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from '@/components/filter/filters.constants';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';
import { MapAny } from '@/types/commonTypes';

interface NavigationState {
  currentIndex: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
}

export const useActivityNavigation = (processId: string) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [getActivityRuns] = useLazyGetActivityRunsQuery();

  const urlIndex = parseIntSafely(searchParams?.get('currentIndex'), -1);
  const urlTotal = parseIntSafely(searchParams?.get('totalRows'), 0);
  const status = searchParams?.get('status');
  const filterContext = searchParams?.get('filterContext');

  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentIndex: urlIndex,
    totalCount: urlTotal,
    hasNext: urlIndex < urlTotal - 1,
    hasPrevious: urlIndex > 0,
    isLoading: true,
  });
  const [currentPageRows, setCurrentPageRows] = useState<MapAny[]>([]);

  const filters = useMemo(() => {
    const decoded = filterContext ? JSON.parse(decodeURIComponent(filterContext)) : {};

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

  const buildQueryConfig = useCallback(() => {
    const request = {
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

    return JSON.parse(getEncodedRequest(request));
  }, [filters]);

  const fetchPageRows = useCallback(
    async (page: number) => {
      const queryConfig = buildQueryConfig();
      const response = await getActivityRuns({
        processId,
        query_config: JSON.stringify({
          ...queryConfig,
          pagination: { page, page_size: PAGE_SIZE },
        }),
      }).unwrap();

      return response;
    },
    [buildQueryConfig, getActivityRuns, processId],
  );

  const initializeFromURL = useCallback(async () => {
    if (urlIndex === -1 || urlTotal === 0) return;

    const page = Math.ceil((urlIndex + 1) / PAGE_SIZE);

    setNavigationState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetchPageRows(page);

      setCurrentPageRows(response.rows || []);
      setNavigationState({
        currentIndex: urlIndex,
        totalCount: urlTotal,
        hasNext: urlIndex < urlTotal - 1,
        hasPrevious: urlIndex > 0,
        isLoading: false,
      });
    } catch (err) {
      captureException(err);
      setNavigationState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [urlIndex, urlTotal, fetchPageRows]);

  const fetchAdjacentActivity = useCallback(
    async (direction: 'next' | 'previous') => {
      const { currentIndex, totalCount } = navigationState;
      const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

      if (targetIndex < 0 || targetIndex >= totalCount) return;

      setNavigationState((prev) => ({ ...prev, isLoading: true }));

      const currentPageStart = Math.floor(currentIndex / PAGE_SIZE) * PAGE_SIZE;
      const isSamePage = targetIndex >= currentPageStart && targetIndex < currentPageStart + PAGE_SIZE;
      const indexInPage = targetIndex % PAGE_SIZE;

      let rows: MapAny[] = [];

      if (isSamePage && currentPageRows.length > 0) {
        rows = currentPageRows;
      } else {
        try {
          const response = await fetchPageRows(Math.floor(targetIndex / PAGE_SIZE) + 1);

          rows = response?.rows || [];
          setCurrentPageRows(rows);
        } catch (err) {
          captureException(err);
          setNavigationState((prev) => ({ ...prev, isLoading: false }));

          return;
        }
      }

      const targetActivity = rows[indexInPage];

      if (!targetActivity) {
        setNavigationState((prev) => ({ ...prev, isLoading: false }));

        return;
      }

      const route = getProcessActivityLogsRouteById(
        processId,
        targetActivity.id,
        status || undefined,
        encodeURIComponent(JSON.stringify(filters)),
        targetIndex,
        totalCount,
      );

      router.replace(route);
    },
    [navigationState, fetchPageRows, currentPageRows, filters, router, processId, status],
  );

  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

  return {
    ...navigationState,
    goToNextActivity: () => fetchAdjacentActivity('next'),
    goToPreviousActivity: () => fetchAdjacentActivity('previous'),
  };
};
