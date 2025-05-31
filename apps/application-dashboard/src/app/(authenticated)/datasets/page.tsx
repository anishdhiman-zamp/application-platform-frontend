'use client';

import { useEffect } from 'react';
import { RowClickedEvent } from 'ag-grid-community';
import { getDatasetRouteById, ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import Listing from 'modules/data';
import { useRouter } from 'next/navigation';
import { RootState } from 'store';
import { addBreadcrumb, resetBreadcrumb } from 'store/slices/layout-configs';

export default function DatasetsPage() {
  const appDispatch = useAppDispatch();
  const router = useRouter();
  const breadcrumbStack = useAppSelector((state: RootState) => state.layoutConfig.breadcrumbStack);

  const onRowClicked = (event: RowClickedEvent) => {
    router.push(getDatasetRouteById(event?.data?.id));
    if (breadcrumbStack?.length > 0 && !breadcrumbStack?.some((item) => item.title === event?.data?.title)) {
      appDispatch(addBreadcrumb({ title: event?.data?.title, href: getDatasetRouteById(event?.data?.id) }));
    }
  };

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Data', href: ROUTES_PATH.DATA }]));
  }, [appDispatch]);

  return <Listing onRowClicked={onRowClicked} />;
}
