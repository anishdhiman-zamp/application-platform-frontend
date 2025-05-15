import React, { ReactElement, useEffect } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import DualAdminHome from 'modules/dualAdmin/DualAdminHome';
import { resetBreadcrumb } from 'store/slices/layout-configs';
import DashboardLayout from 'components/layouts/dashboard-layout';

const DualAdmin = () => {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Dual Admin', href: ROUTES_PATH.POLICIES }]));
  }, []);

  return <DualAdminHome />;
};

DualAdmin.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default DualAdmin;
