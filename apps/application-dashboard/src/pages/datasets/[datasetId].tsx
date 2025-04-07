import React, { ReactElement } from 'react';
import DatasetById from 'modules/data/Dataset';
import { useParams } from 'next/navigation';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Dataset = () => {
  const { datasetId } = useParams();

  return <DatasetById id={datasetId as string} />;
};

Dataset.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Dataset;
