import React, { ReactElement, useEffect } from 'react';
import { RowClickedEvent } from 'ag-grid-community';
import { getDatasetRouteById, ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch, useAppSelector } from 'hooks/toolkit';
import Listing from 'modules/data';
import { useRouter } from 'next/router';
import { RootState } from 'store';
import { addBreadcrumb, resetBreadcrumb } from 'store/slices/layout-configs';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Home = () => {
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
  }, []);

  return <Listing onRowClicked={onRowClicked} />;
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Home;
