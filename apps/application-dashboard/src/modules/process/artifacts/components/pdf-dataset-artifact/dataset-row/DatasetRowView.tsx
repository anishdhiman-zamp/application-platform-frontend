import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { GridApi } from 'ag-grid-community';
import Row from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/Row';
import RowHeader from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/RowHeader';
import RowViewLoader from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/RowViewLoader';
import { DatasetFilterConfigResponseType } from 'types/api/dataset.types';
import type { ColumnDef } from '@/components/common/agGridTable/AgGridTable';
import CustomNoRowsOverlay from '@/components/common/table/CustomNoRowsOverlay';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { getColumnOrderingVisibilityForCurrentDataset } from '@/modules/data/data.utils';
import { useArtifactContextStore } from '@/modules/process/artifacts/context/artifact.context';
import { ARTIFACT_TYPE } from '@/modules/process/process.types';
import type { MissingFieldItemType } from '@/types/api/processApi.types';
import type { MapAny } from '@/types/commonTypes';

interface DatasetRowViewProps {
  datasetId: string;
  activityId: string;
  totalRows: number;
  rowData: MapAny | null;
  selectedRowIndex: number | null;
  navigateRow: (direction: 1 | -1) => void;
  gridApi: GridApi | null;
  columns: ColumnDef[];
  isMissingFieldsBarVisible: boolean;
  isDatasetFetching: boolean;
  selectedKey: string;
  onChange?: (key: string, value: string, rowId: string) => void;
  requiredMissingFields?: MissingFieldItemType[];
  missingFields?: MissingFieldItemType[];
  currentUserHasEditAccess: boolean;
  onValueClick?: (rowIndex: string, column: string) => void;
  showPdfSearch?: boolean;
  filterConfig?: DatasetFilterConfigResponseType[];
}

const DatasetRowView: FC<DatasetRowViewProps> = ({
  datasetId,
  activityId,
  totalRows,
  rowData,
  selectedRowIndex,
  navigateRow,
  gridApi,
  columns,
  isDatasetFetching,
  selectedKey,
  onChange,
  isMissingFieldsBarVisible,
  requiredMissingFields,
  missingFields,
  currentUserHasEditAccess,
  onValueClick,
  showPdfSearch,
  filterConfig,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedKeyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [clickedField, setClickedField] = useState<string>('');

  const {
    state: { artifactType },
  } = useArtifactContextStore();

  const isPdfDataset = useMemo(() => artifactType === ARTIFACT_TYPE.PDF_DATASET, [artifactType]);

  const columnOrdering = getColumnOrderingVisibilityForCurrentDataset(datasetId);

  useEffect(() => {
    if (!selectedKey || !selectedKeyRef.current || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const element = selectedKeyRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scrollTop =
      container.scrollTop + elementRect.top - containerRect.top - containerRect.height / 2 + elementRect.height / 2;

    container.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
  }, [selectedKey]);

  // Memoize the sorted entries of `rowData` based on the specified `columnOrdering`
  const orderedEntries = useMemo(() => {
    // If there's no row data, return an empty array
    if (!rowData) return [];

    // Convert the `rowData` object into an array of [key, value] pairs
    const entries = Object.entries(rowData);

    // If no column ordering is provided, return the original entries as-is
    if (!columnOrdering?.length) return entries;

    // Sort the entries based on their order in the `columnOrdering` array
    return entries.sort(([keyA], [keyB]) => {
      const indexA = columnOrdering.findIndex((col) => col.colId === keyA);
      const indexB = columnOrdering.findIndex((col) => col.colId === keyB);

      // If both keys are found in columnOrdering, sort them by their respective indices
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;

      // If only keyA is found, place it before keyB
      if (indexA !== -1) return -1;

      // If only keyB is found, place it before keyA
      if (indexB !== -1) return 1;

      // If neither key is found in columnOrdering, preserve their current order
      return 0;
    });
  }, [rowData, columnOrdering]);

  return (
    <CommonWrapper
      isLoading={isDatasetFetching}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<RowViewLoader />}
      isNoData={totalRows === 0}
      noDataBanner={<CustomNoRowsOverlay />}
      className={cn('absolute inset-0 z-20 flex h-[calc(100vh-210px)] w-full flex-col', {
        'pb-10': isMissingFieldsBarVisible,
      })}
    >
      {totalRows > 1 && (
        <RowHeader
          selectedRowIndex={selectedRowIndex ?? 0}
          totalRows={totalRows}
          navigateRow={navigateRow}
          gridApi={gridApi ?? null}
        />
      )}

      <div
        ref={scrollContainerRef}
        className='border-GRAY_400 h-full w-full flex-1 overflow-y-scroll border-t-[0.5px] [scrollbar-width:none]'
      >
        <div className='flex w-full flex-col'>
          {rowData &&
            orderedEntries.map((entry) => (
              <Row
                key={`${rowData?.id ?? rowData?._zamp_id}-${entry[0]}`}
                keyValue={entry}
                rowId={rowData?.id ?? rowData?._zamp_id}
                selectedKey={selectedKey}
                columns={columns}
                onChange={onChange}
                missingFields={missingFields}
                requiredMissingFields={requiredMissingFields}
                currentUserHasEditAccess={currentUserHasEditAccess}
                textareaRef={textareaRef}
                selectedKeyRef={selectedKeyRef}
                onValueClick={onValueClick}
                clickedField={clickedField}
                setClickedField={setClickedField}
                datasetId={datasetId}
                activityId={activityId}
                showPdfSearch={showPdfSearch}
                filterConfig={filterConfig}
                rowData={rowData}
                isPdfDataset={isPdfDataset}
              />
            ))}
        </div>
      </div>
    </CommonWrapper>
  );
};

export default DatasetRowView;
