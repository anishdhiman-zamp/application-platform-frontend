import React, { ReactElement } from 'react';
import DatasetById from 'modules/data/Dataset';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Dataset = () => {
  return <DatasetById />;
};

Dataset.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Dataset;
