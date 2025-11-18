'use client';

import { useMemo } from 'react';
import { LISTING_COLUMNS } from 'modules/data/data.constants';
import { useGetDatasetListingQuery } from '@/apis/dataset';
import ZampLogoWebpLoader from '@/components/common/loader/ZampLogoWebpLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import DataTable from 'components/common/table/DataTable';
import { PAGE_SIZE } from 'components/common/table/table.constants';

const Listing = () => {
  const { data, isLoading } = useGetDatasetListingQuery(
    { page: 1, pageSize: PAGE_SIZE },
    {
      refetchOnMountOrArgChange: false,
    },
  );
  const columns = useMemo(() => LISTING_COLUMNS, []);

  return (
    <CommonWrapper
      isLoading={isLoading}
      loader={<ZampLogoWebpLoader />}
      skeletonType={SkeletonTypes.CUSTOM}
      className='h-full'
    >
      <div className='overflow-hidden rounded-tl-xl' id='full-height-cell-table'>
        <DataTable
          columns={columns}
          rows={data?.datasets ?? []}
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
