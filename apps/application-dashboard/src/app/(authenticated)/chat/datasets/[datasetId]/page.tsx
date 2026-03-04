'use client';

import { useEffect } from 'react';
import { useResource } from '@zamp-platform/battalion';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import type { Dataset } from '@/app/(authenticated)/resources';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
const DatasetById = dynamic(() => import('modules/data/Dataset'));

export default function DatasetPage() {
  const router = useRouter();
  const { datasetId } = useParams<{ datasetId: string }>() ?? { datasetId: '' };
  const { data: datasets, isLoading } = useResource<Dataset>('Dataset');

  useEffect(() => {
    if (datasetId && !isLoading) {
      const datasetExists = datasets?.some((dataset) => dataset?.id === datasetId);

      if (!datasetExists) {
        router.replace(ROUTES_PATH.DATA);
      }
    }
  }, [datasetId, isLoading, datasets, router]);

  if (!datasets?.length) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />;
  }

  return <DatasetById id={datasetId} />;
}
