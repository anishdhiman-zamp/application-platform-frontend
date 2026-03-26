'use client';

import { useParams } from 'next/navigation';
import PaceDatasetDetail from '@/modules/pace/datasets/PaceDatasetDetail';

const DatasetDetailPage = () => {
  const params = useParams<{ tableName: string }>();

  if (!params?.tableName) return null;

  const tableName = decodeURIComponent(params.tableName);

  return <PaceDatasetDetail tableName={tableName} />;
};

export default DatasetDetailPage;
