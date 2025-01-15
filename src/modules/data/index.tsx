import React, { useMemo } from 'react';
import { RowClickedEvent } from 'ag-grid-community';
import { useGetDatasetListingQuery } from 'apis/dataset';
import { ROUTES_PATH } from 'constants/routeConfig';
import { formatData } from 'modules/data/utils';
import { LISTING_COLUMNS } from 'modules/dummydata/data.constants';
import { useRouter } from 'next/router';
import DataTable from 'components/common/table/DataTable';

const Listing = () => {
  const { data } = useGetDatasetListingQuery();

  const formattedData = useMemo(() => formatData(data ?? []), [data]);
  const columns = useMemo(() => LISTING_COLUMNS, []);

  const router = useRouter();

  const onRowClicked = (event: RowClickedEvent) => {
    router.push(ROUTES_PATH.DATASET.replace(':datasetId', event?.data?.id));
  };

  return <DataTable columns={columns} rows={formattedData} onRowClicked={onRowClicked} />;
};

export default Listing;
