'use client';

import { useEffect, useMemo } from 'react';
import { useResource } from '@zamp-platform/battalion';
import { getOrgColumnConfigs } from '@zamp-platform/dataset-create-edit';
import { LISTING_COLUMNS } from 'modules/data/data.constants';
import { syncAllDatasetNamesToLocalStorage } from 'modules/data/data.utils';
import { useDatasetSSE } from 'modules/data/hooks/useDatasetSSE';
import type { Dataset } from '@/app/(authenticated)/resources';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import DataTable from 'components/common/table/DataTable';

const Listing = () => {
  useDatasetSSE({ invalidateListing: true }); // Listen for dataset SSE events to auto-refresh listing
  // Use Battalion resource hook for optimistic updates (like processes do)
  const { data: datasets, isLoading, isFetching } = useResource<Dataset>('Dataset');
  const columns = useMemo(() => LISTING_COLUMNS, []);
  // Show loader on initial load OR when refetching with no data
  const shouldShowLoader = isLoading || (isFetching && (!datasets || datasets.length === 0));

  // Sync dataset names and column types from listing API to localStorage
  const syncDatasetsIfLocalStorageEmpty = (datasets: Dataset[]) => {
    if (!datasets || datasets.length === 0) return;

    try {
      const orgConfigs = getOrgColumnConfigs();
      const hasAnyData = Object.keys(orgConfigs).length > 0;

      // Only sync if localStorage is completely empty for current org
      if (!hasAnyData) {
        syncAllDatasetNamesToLocalStorage(datasets as any);
      }
    } catch {
      // If error reading localStorage, sync from backend
      syncAllDatasetNamesToLocalStorage(datasets as any);
    }
  };

  useEffect(() => {
    syncDatasetsIfLocalStorageEmpty(datasets ?? []);
  }, [datasets]);

  return (
    <CommonWrapper
      isLoading={shouldShowLoader}
      loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />}
      skeletonType={SkeletonTypes.CUSTOM}
      className='h-full'
    >
      <div className='overflow-hidden rounded-tl-xl' id='full-height-cell-table'>
        <DataTable
          columns={columns}
          rows={datasets ?? []}
          overrideThemeParams={{
            cellHorizontalPadding: 0,
          }}
          suppressScrollOnNewData
        />
      </div>
    </CommonWrapper>
  );
};

export default Listing;
