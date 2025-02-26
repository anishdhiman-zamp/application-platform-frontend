import React, { useMemo } from 'react';
import { IServerSideDatasource, IServerSideGetRowsParams, RowClickedEvent } from 'ag-grid-community';
import { useLazyGetDatasetListingQuery } from 'apis/dataset';
import { getDatasetRouteById } from 'constants/routeConfig';
import { useAppDispatch } from 'hooks/toolkit';
import { LISTING_COLUMNS } from 'modules/data/data.constants';
import { formatData } from 'modules/data/data.utils';
import { useRouter } from 'next/router';
import { addBreadcrumb } from 'store/slices/layout-configs';
import { OrderType } from 'types/components/table.type';
import DataTable from 'components/common/table/DataTable';
import { PAGE_SIZE } from 'components/common/table/table.constants';

const Listing = () => {
  const router = useRouter();
  const appDispatch = useAppDispatch();
  const [getDatasetListing] = useLazyGetDatasetListingQuery();
  const columns = useMemo(() => LISTING_COLUMNS, []);

  const onRowClicked = (event: RowClickedEvent) => {
    router.push(getDatasetRouteById(event?.data?.id));
    appDispatch(addBreadcrumb(event?.data?.title));
  };

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        const sortModel =
          parameters.request.sortModel?.map((item) => ({
            column: item.colId,
            desc: item.sort === OrderType.DESC,
          })) ?? [];

        getDatasetListing(
          {
            page: Math.floor(parameters.request.endRow ?? 0) / PAGE_SIZE,
            pageSize: PAGE_SIZE,
            sort: JSON.stringify(sortModel),
          },
          true,
        )
          .unwrap()
          .then((data) => {
            parameters.success({
              rowData: formatData(data?.datasets ?? []),
              ...(parameters.request.startRow === 0 ? { rowCount: data?.total_count } : {}),
            });
          })
          .catch(() => {
            parameters.fail();
          });
      },
    };
  }, [getDatasetListing]);

  return (
    <div className='rounded-tl-xl overflow-hidden'>
      <DataTable columns={columns} onRowClicked={onRowClicked} serverSideDatasource={serverSideDatasource} />
    </div>
  );
};

export default Listing;
