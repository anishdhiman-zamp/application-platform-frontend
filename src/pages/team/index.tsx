import React, { ReactElement, useEffect } from 'react';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import PeoplePage from 'modules/team/PeoplePage';
import { resetBreadcrumb } from 'store/slices/layout-configs';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Team = () => {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(resetBreadcrumb([{ title: 'Team', href: ROUTES_PATH.TEAM }]));
  }, []);

  return <PeoplePage />;
};

Team.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Team;
