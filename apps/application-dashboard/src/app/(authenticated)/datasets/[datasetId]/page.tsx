'use client';

import DatasetById from 'modules/data/Dataset';
import { useParams } from 'next/navigation';

export default function DatasetPage() {
  const { datasetId } = useParams<{ datasetId: string }>() ?? { datasetId: '' };

  return <DatasetById id={datasetId} />;
}
