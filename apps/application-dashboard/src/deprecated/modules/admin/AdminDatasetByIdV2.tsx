import { useGetDatasetFilterConfigQuery } from '@/apis/dataset';
import ImageLoader from '@/components/common/loader/ImageLoader';
import DatasetTable from '@/components/common/table/DatasetTable';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { DisplayConfigHeadersListV2 } from '@/deprecated/modules/admin/admin.constants';
import { AdminDatasetByIdPropsType } from '@/deprecated/modules/admin/admin.types';
import { transformDatasetFilterConfigResponseTypeToDisplayConfigType } from '@/deprecated/modules/admin/admin.utils';
import AdminHeader from '@/deprecated/modules/admin/AdminHeader';
import { DisplayConfigType } from '@/types/api/admin.types';
import { CellEditRequestEvent, RowDragEndEvent } from 'ag-grid-community';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import { FC, useEffect, useMemo, useState } from 'react';
import { cn } from 'utils/common';

const AdminDatasetByIdV2: FC<AdminDatasetByIdPropsType> = ({ id }) => {
  const { isFetching, data, isError } = useGetDatasetFilterConfigQuery(
    {
      datasetId: id,
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    },
  );

  const [displayConfigUpdatedData, setDisplayConfigUpdatedData] = useState<DisplayConfigType[]>();

  const displayConfigData = useMemo(
    () => transformDatasetFilterConfigResponseTypeToDisplayConfigType(data?.data ?? []),
    [data?.data],
  );

  const handleCellEditRequest = (event: CellEditRequestEvent) => {
    const { colDef, newValue, node } = event;
    const { field } = colDef;
    const updatedRow = { ...event.data, [field as string]: newValue };

    // Optimistic update
    node.setData(updatedRow);
    setDisplayConfigUpdatedData((prev) => {
      const index = prev?.findIndex((item) => item.column === updatedRow.column);
      const updatedData = [...(prev || [])];

      if (index !== undefined && prev) {
        updatedData[index] = updatedRow;

        return updatedData;
      }

      return updatedData;
    });
  };

  const handleRowDragEnd = (event: RowDragEndEvent) => {
    const rowCount = event.api.getDisplayedRowCount();
    const newOrder = [];

    for (let i = 0; i < rowCount; i++) {
      const rowNode = event.api.getDisplayedRowAtIndex(i);

      if (rowNode) {
        newOrder.push(rowNode.data);
      }
    }
    setDisplayConfigUpdatedData(newOrder);
  };

  useEffect(() => {
    if ((displayConfigData?.length ?? 0) > 0) {
      setDisplayConfigUpdatedData(displayConfigData);
    }
  }, [displayConfigData]);

  return (
    <CommonWrapper
      className={cn('h-full', {
        'flex flex-col items-center justify-center': isFetching,
      })}
      isLoading={isFetching}
      isError={isError}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} className='z-1000 overflow-y-auto' />
      }
    >
      <AdminHeader
        displayConfigInitialData={displayConfigData ?? []}
        displayConfigFinalData={displayConfigUpdatedData ?? []}
        datasetId={id}
      />
      <DatasetTable
        columns={DisplayConfigHeadersListV2}
        rows={displayConfigData ?? []}
        onCellEditRequest={handleCellEditRequest}
        onRowDragEnd={handleRowDragEnd}
        enableRowDrag
        columnConfig={{ filter: false, sortable: false }}
        totalRows={displayConfigData?.length ?? 0}
      />
    </CommonWrapper>
  );
};

export default AdminDatasetByIdV2;
