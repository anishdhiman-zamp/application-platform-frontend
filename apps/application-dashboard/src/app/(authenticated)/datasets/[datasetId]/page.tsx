'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useGetAllDatasetsQuery } from '@/apis/dataset';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

const DatasetById = dynamic(() => import('modules/data/Dataset'));

export default function DatasetPage() {
  const { datasetId } = useParams<{ datasetId: string }>() ?? { datasetId: '' };

  // Fetch all datasets to check if this datasetId exists
  const { data: allDatasetsData, isLoading: isAllDatasetsLoading } = useGetAllDatasetsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  // Show loader while waiting for listing data
  if (isAllDatasetsLoading) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />;
  }

  // Check if dataset exists in the listing
  const isCreationMode = allDatasetsData?.datasets?.some((dataset) => dataset?.ID === datasetId);

  return <DatasetById id={datasetId} isCreating={!isCreationMode} />;
}
