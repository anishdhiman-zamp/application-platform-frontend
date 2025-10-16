import { FC, useMemo } from 'react';
import { RowClickedEvent } from 'ag-grid-community';
import { LISTING_COLUMNS } from 'modules/data/data.constants';
import { ListingPropsType } from 'modules/data/data.types';
import { useGetDatasetListingQuery } from '@/apis/dataset';
import ZampLogoWebpLoader from '@/components/common/loader/ZampLogoWebpLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import DataTable from 'components/common/table/DataTable';
import { PAGE_SIZE } from 'components/common/table/table.constants';

const Listing: FC<ListingPropsType> = ({ onRowClicked }) => {
  const { data, isLoading } = useGetDatasetListingQuery({ page: 1, pageSize: PAGE_SIZE });
  const columns = useMemo(() => LISTING_COLUMNS, []);

  const handleRowClicked = (event: RowClickedEvent) => {
    const target = event?.event?.target as HTMLElement;

    if (target.closest('#edit-name-description')) return;

    onRowClicked?.(event);
  };

  return (
    <CommonWrapper
      isLoading={isLoading}
      loader={<ZampLogoWebpLoader />}
      skeletonType={SkeletonTypes.CUSTOM}
      className='h-full'
    >
      <div className='overflow-hidden rounded-tl-xl'>
        <DataTable
          columns={columns}
          onRowClicked={handleRowClicked}
          rows={data?.datasets ?? []}
          suppressScrollOnNewData
        />
      </div>
    </CommonWrapper>
  );
};

export default Listing;
