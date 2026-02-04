'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useGetDatasetListingQuery } from '@/apis/dataset';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { PAGE_SIZE } from '@/components/common/table/table.constants';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
const DatasetById = dynamic(() => import('modules/data/Dataset'));

export default function DatasetPage() {
  const router = useRouter();
  const { datasetId } = useParams<{ datasetId: string }>() ?? { datasetId: '' };
  const { data: datasetListingData, isLoading: isDatasetListingLoading } = useGetDatasetListingQuery(
    { page: 1, pageSize: PAGE_SIZE },
    {
      skip: !datasetId,
      refetchOnMountOrArgChange: false,
    },
  );

  useEffect(() => {
    if (datasetId && !isDatasetListingLoading) {
      const datasetExists = datasetListingData?.datasets?.some((dataset) => dataset?.id === datasetId);

      if (!datasetExists) {
        router.replace(ROUTES_PATH.DATA);
      }
    }
  }, [datasetId, isDatasetListingLoading, datasetListingData, router]);

  if (!datasetListingData?.datasets?.length) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />;
  }

  return <DatasetById id={datasetId} />;
}
