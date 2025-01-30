import React, { useMemo, useState } from 'react';
import { CellDoubleClickedEvent, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { useLazyGetDatasetListingQuery } from 'apis/dataset';
import { getDatasetRouteById } from 'constants/routeConfig';
import ShareDatasetPopup from 'modules/data/components/ShareDatasetPopup';
import { LISTING_COLUMNS } from 'modules/data/data.constants';
import { formatData } from 'modules/data/data.utils';
import { useRouter } from 'next/router';
import DataTable from 'components/common/table/DataTable';
import { PAGE_SIZE } from 'components/common/table/table.constants';

const Listing = () => {
  const router = useRouter();
  const [getDatasetListing] = useLazyGetDatasetListingQuery();
  const columns = useMemo(() => LISTING_COLUMNS, []);
  const [isShareDatasetPopupOpen, setIsShareDatasetPopupOpen] = useState<boolean>(false);

  const onRowClicked = (event: CellDoubleClickedEvent) => {
    router.push(getDatasetRouteById(event?.data?.id));
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

  const handleCloseShareDatasetPopup = () => {
    setIsShareDatasetPopupOpen(false);
  };

  return (
    <>
      <DataTable columns={columns} onRowClicked={onRowClicked} serverSideDatasource={serverSideDatasource} />
      <ShareDatasetPopup isOpen={isShareDatasetPopupOpen} onClose={handleCloseShareDatasetPopup} datasetId='' />
    </>
  );
};

export default Listing;
