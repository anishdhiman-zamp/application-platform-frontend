'use client';

import { useParams } from 'next/navigation';
import DrilldownMultiDataset from '@/modules/data/DrilldownMultiDataset';
const MultiDatasetDrilldown = () => {
  const params = useParams();

  return <DrilldownMultiDataset datasetIds={params?.datasetIds as string} />;
};

export default MultiDatasetDrilldown;
