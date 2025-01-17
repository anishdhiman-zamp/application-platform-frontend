import React, { useMemo } from 'react';
import { IServerSideDatasource, IServerSideGetRowsParams, RowClickedEvent } from 'ag-grid-community';
import { useLazyGetDatasetListingQuery } from 'apis/dataset';
import { ROUTES_PATH } from 'constants/routeConfig';
import { formatData } from 'modules/data/utils';
import { LISTING_COLUMNS } from 'modules/dummydata/data.constants';
import { useRouter } from 'next/router';
import { PAGE_SIZE } from 'components/common/table/constants';
import DataTable from 'components/common/table/DataTable';

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
