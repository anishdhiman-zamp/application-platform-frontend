import React, { useMemo } from 'react';
import { IServerSideDatasource, IServerSideGetRowsParams, RowClickedEvent } from 'ag-grid-community';
import { useLazyGetDatasetListingQuery } from 'apis/dataset';
import { ROUTES_PATH } from 'constants/routeConfig';
import { LISTING_COLUMNS } from 'modules/data/data.constants';
import { formatData } from 'modules/data/data.utils';
import { useRouter } from 'next/router';
import DataTable from 'components/common/table/DataTable';
import { PAGE_SIZE } from 'components/common/table/table.constants';

const Listing = () => {
  const [getDatasetListing] = useLazyGetDatasetListingQuery();
  const columns = useMemo(() => LISTING_COLUMNS, []);

  const router = useRouter();

  const onRowClicked = (event: RowClickedEvent) => {
    router.push(ROUTES_PATH.DATASET.replace(':datasetId', event?.data?.id));
  };

  const serverSideDatasource: IServerSideDatasource = useMemo(() => {
    return {
      getRows: (parameters: IServerSideGetRowsParams): void => {
        getDatasetListing({
          page: Math.floor(parameters.request.endRow ?? 0) / PAGE_SIZE,
          pageSize: PAGE_SIZE,
        })
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

  return <DataTable columns={columns} onRowClicked={onRowClicked} serverSideDatasource={serverSideDatasource} />;
};

export default Listing;
