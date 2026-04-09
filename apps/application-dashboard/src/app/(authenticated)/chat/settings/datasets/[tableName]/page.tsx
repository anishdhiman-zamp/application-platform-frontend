'use client';

import { useParams } from 'next/navigation';
import DatasetDetail from '@/modules/pace/components/datasets/DatasetDetail';

const DatasetDetailPage = () => {
  const params = useParams<{ tableName: string }>();

  if (!params?.tableName) return null;

  const tableName = decodeURIComponent(params.tableName);

  return <DatasetDetail tableName={tableName} />;
};

export default DatasetDetailPage;
