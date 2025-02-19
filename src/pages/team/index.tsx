import React, { ReactElement } from 'react';
import PeoplePage from 'modules/team/PeoplePage';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Team = () => {
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
