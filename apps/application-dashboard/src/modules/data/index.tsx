'use client';

import { useMemo } from 'react';
import { LISTING_COLUMNS } from 'modules/data/data.constants';
import { useGetDatasetListingQuery } from '@/apis/dataset';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
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
      loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='rounded-tl-xl' />}
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
