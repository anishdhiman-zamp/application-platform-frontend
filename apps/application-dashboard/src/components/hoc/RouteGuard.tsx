'use client';

import { FC, ReactNode, useEffect } from 'react';
import { useGetDatasetListingQuery } from 'apis/dataset';
import { useGetPagesQuery } from 'apis/pages';
import { ENVIRONMENT, ENVIRONMENT_TYPES } from 'constants/common.constants';
import { FEATURE_FLAGS } from 'constants/featureFlags';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useFeatureFlags } from 'hooks/useFeatureFlags';
import { useWindowDimensions } from 'hooks/useWindowDimensions';
import ScreenSupport from 'modules/cards/ScreenSupport';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { checkScreenBreakpoint, getLeadingPathFromURL } from 'utils/common';
import DashboardDowntime from '@/modules/cards/DashboardDowntime';
import { LOCAL_STORAGE_KEYS } from '@/utils/localstorage';
import { PAGE_SIZE } from 'components/common/table/table.constants';

type AuthGuardPropsType = {
  children: ReactNode;
};

export const RouteGuard: FC<AuthGuardPropsType> = (props) => {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const isGodMode = localStorage.getItem(LOCAL_STORAGE_KEYS.XZAMP_GOD_MODE);

  const currentPathName = getLeadingPathFromURL(pathname);
  const PAGES = getLeadingPathFromURL(ROUTES_PATH.PAGES);
  const DATASETS = getLeadingPathFromURL(ROUTES_PATH.DATASET);
  const isAdminRoute = pathname.startsWith(ROUTES_PATH.ADMIN);

  const { evaluate, ldClient } = useFeatureFlags();
  const { width, height } = useWindowDimensions();

  const { data: datasetListingData, isLoading: isDatasetListingLoading } = useGetDatasetListingQuery(
    { page: 1, pageSize: PAGE_SIZE },
    {
      skip: currentPathName !== DATASETS || !id,
      refetchOnMountOrArgChange: false,
    },
  );

  const { data: pages, isLoading: isPagesLoading } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    if (currentPathName === DATASETS && id && !isDatasetListingLoading) {
      const pageExists = datasetListingData?.datasets?.some((dataset) => dataset?.id === id);

      if (!pageExists) {
        router.push(ROUTES_PATH.NO_ACCESS);
      }
    }
  }, [currentPathName, id, isDatasetListingLoading, datasetListingData, router]);

  useEffect(() => {
    if (currentPathName === PAGES && !isPagesLoading && id && pages) {
      const pageExists = pages.some((page) => page?.page_id === id);

      if (!pageExists) {
        router.push(ROUTES_PATH.NO_ACCESS);
      }
    }
  }, [currentPathName, id, pages, isPagesLoading, router]);

  useEffect(() => {
    if (isAdminRoute && ldClient) {
      evaluate(FEATURE_FLAGS.ADMIN_PAGE).then((isAdminFeatureEnabled) => {
        if (!isAdminFeatureEnabled) {
          router.push(ROUTES_PATH.NO_ACCESS);
        }
      });
    }
  }, [isAdminRoute, evaluate, ldClient, router, props.children]);

  const breakpoint = checkScreenBreakpoint(width, height);

  if (breakpoint && ENVIRONMENT === ENVIRONMENT_TYPES.PRODUCTION) return <ScreenSupport />;

  if (!isGodMode) {
    return <DashboardDowntime />;
  }

  return props.children;
};
