'use client';

import { RowClickedEvent } from 'ag-grid-community';
import { getDatasetRouteById } from 'constants/routeConfig';
import Listing from 'modules/data';
import { useRouter } from 'next/navigation';

export default function DatasetsPage() {
  const router = useRouter();

  const onRowClicked = (event: RowClickedEvent) => {
    router.push(getDatasetRouteById(event?.data?.id));
  };

  return <Listing onRowClicked={onRowClicked} />;
}
