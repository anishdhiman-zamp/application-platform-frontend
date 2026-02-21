'use client';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const DatasetById = dynamic(() => import('modules/data/Dataset'));

export default function DatasetPage() {
  const { datasetId } = useParams<{ datasetId: string }>() ?? { datasetId: '' };

  return <DatasetById id={datasetId} />;
}
