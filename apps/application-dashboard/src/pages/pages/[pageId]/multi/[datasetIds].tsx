import { ReactElement } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import DrilldownMultiDataset from '@/modules/data/DrilldownMultiDataset';
const MultiDatasetDrilldown = () => {
  const params = useParams();

  return <DrilldownMultiDataset datasetIds={params?.datasetIds as string} />;
};

MultiDatasetDrilldown.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default MultiDatasetDrilldown;
