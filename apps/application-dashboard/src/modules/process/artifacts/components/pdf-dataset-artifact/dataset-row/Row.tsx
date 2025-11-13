import type { FC, RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LocationType } from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { DATE_FORMATS } from '@zamp-platform/utils';
import DisplayField from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/DisplayField';
import EditableField from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/EditableField';
import { useCompletedFields } from 'modules/process/artifacts/context/completedFields.context';
import { useParams } from 'next/navigation';
import type { DatasetFilterConfigResponseType } from 'types/api/dataset.types';
import type { MapAny } from 'types/commonTypes';
import type { ColumnDef } from '@/components/common/agGridTable/AgGridTable';
import { CUSTOM_COLUMNS_TYPE, VALUE_FORMAT_TYPE } from '@/components/common/table/table.types';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import ChatbotWrapper from '@/modules/chatbot';
import CommentButton from '@/modules/chatbot/CommentButton';
import {
  getColumnOrderingVisibilityForCurrentDataset,
  getFormattedDate,
  getValueFormatter,
} from '@/modules/data/data.utils';
import { isValueEmpty } from '@/modules/widgets/TreeTable/utils';
import type { MissingFieldItemType } from '@/types/api/processApi.types';

interface RowProps {
  keyValue: [string, string];
  rowId: string;
  selectedKey: string;
  columns: ColumnDef[];
  onChange?: (key: string, value: string, rowId: string) => void;
  missingFields?: MissingFieldItemType[];
  requiredMissingFields?: MissingFieldItemType[];
  currentUserHasEditAccess: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  selectedKeyRef: RefObject<HTMLDivElement | null>;
  onValueClick?: (rowIndex: string, column: string) => void;
  clickedField: string;
  setClickedField: (field: string) => void;
  datasetId: string;
  activityId: string;
  showPdfSearch?: boolean;
  filterConfig?: DatasetFilterConfigResponseType[];
  rowData: MapAny;
  isPdfDataset?: boolean;
}

const Row: FC<RowProps> = ({
  keyValue: [key, value],
  rowId,
  selectedKey,
  activityId,
  columns,
  onChange,
  missingFields = [],
  requiredMissingFields = [],
  currentUserHasEditAccess,
  textareaRef,
  selectedKeyRef,
  onValueClick,
  clickedField,
  setClickedField,
  datasetId,
  filterConfig = [],
  rowData,
  isPdfDataset = false,
}) => {
  const {
    state: { completedFields },
  } = useCompletedFields();
  const params = useParams();
  const processId = params?.processId as string;
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState('');

  const fieldId = `${rowId}-${key}`;
  const isSelected = selectedKey === key;
  const isClicked = clickedField === fieldId;
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const column = useMemo(() => columns.find((col) => col?.field === key), [columns, key]);
  const columnConfig = useMemo(() => filterConfig.find((col) => col?.column === key), [filterConfig, key]);
  const currentDatasetCompletedFields = useMemo(
    () => completedFields[activityId]?.[datasetId] ?? [],
    [completedFields, datasetId, activityId],
  );

  const isColumnVisible =
    getColumnOrderingVisibilityForCurrentDataset(datasetId).find((col) => col?.colId === key)?.isVisible ?? true;

  const valueFormatter = useMemo(() => (columnConfig ? getValueFormatter(columnConfig) : undefined), [columnConfig]);

  const formattedValue = useMemo(() => {
    if (columnConfig?.type === FILTER_TYPES.DATE_RANGE && !columnConfig?.metadata?.config?.value_format) {
      return getFormattedDate({ type: VALUE_FORMAT_TYPE.DATE_TIME, value: DATE_FORMATS.ddMMMyyyy }, value) as string;
    }

    if (columnConfig?.metadata?.custom_type === CUSTOM_COLUMNS_TYPE.DOCUMENT) {
      return Array.isArray(value) ? value[0]?.name : value;
    }

    const formatted = valueFormatter?.(undefined, value, rowData) ?? value;

    return formatted ?? '';
  }, [value, rowData, valueFormatter, columnConfig]);

  const isEditable = useMemo(
    () =>
      !!column?.cellRendererParams?.is_editable &&
      currentUserHasEditAccess &&
      (missingFields.length === 0 || missingFields.some((field) => field?.column === key && field?.id === rowId)),
    [column, currentUserHasEditAccess, missingFields, key, rowId],
  );

  const isRequired = useMemo(
    () => requiredMissingFields.some((field) => field?.column === key),
    [requiredMissingFields, key],
  );

  const isCompleted = useMemo(
    () =>
      currentDatasetCompletedFields.some((field) => field?.columnId === key && field?.rowId === rowId) &&
      !isValueEmpty(value) &&
      missingFields.some((field) => field?.column === key && field?.id === rowId),
    [currentDatasetCompletedFields, key, rowId, value, missingFields],
  );

  const shouldShowInputDirectly = useMemo(() => isEditable && !isCompleted, [isEditable, isCompleted]);

  const handleClick = () => {
    setClickedField(fieldId);
    onValueClick?.(rowId, key);
  };

  const handleDoubleClick = () => {
    if (isEditable) {
      setIsEditing(true);
      setEditingValue(value);
    }
  };

  const handleEditSave = () => {
    if (editingValue !== value) {
      onChange?.(key, editingValue, rowId);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditingValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === KEYBOARD_KEYS.ENTER && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === KEYBOARD_KEYS.ESCAPE) {
      handleEditCancel();
    }
  };

  useEffect(() => setEditingValue(formattedValue), [formattedValue]);

  useEffect(() => {
    if (isEditing) {
      editTextareaRef.current?.focus();
    }
  }, [isEditing]);

  if (!column || !isColumnVisible) return null;

  return (
    <div
      key={key}
      ref={isSelected ? selectedKeyRef : null}
      className={cn(
        'border-GRAY_100 hover:bg-BG_GRAY_1 group relative flex w-full flex-col gap-y-2 border-b-[0.5px] px-6 pt-3 pb-4 transition-colors duration-200',
        { 'bg-BG_GRAY_1': isSelected },
      )}
    >
      <span className='f-11-450 text-GRAY_700'>{column.headerName}</span>
      <div className='group flex w-full items-center justify-between'>
        {isEditable ? (
          <EditableField
            value={formattedValue}
            editingValue={editingValue}
            onInputChange={setEditingValue}
            onBlur={handleEditSave}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            isEditing={isEditing}
            shouldShowInputDirectly={shouldShowInputDirectly}
            isRequired={isRequired}
            isCompleted={isCompleted}
            isSelected={isSelected}
            textareaRef={textareaRef}
            editTextareaRef={editTextareaRef}
            isClicked={isClicked}
            isPdfDataset={isPdfDataset}
          />
        ) : (
          <DisplayField
            value={formattedValue}
            isCompleted={isCompleted}
            isClicked={isClicked}
            onClick={handleClick}
            isPdfDataset={isPdfDataset}
          />
        )}
        <ChatbotWrapper
          annotationLocation={{
            type: LocationType.DATASET_FIELD,
            data: {
              process_id: processId,
              activity_run_id: activityId,
              dataset_id: datasetId,
              dataset_row_id: rowId,
              dataset_field_id: key,
            },
          }}
        >
          <CommentButton />
        </ChatbotWrapper>
      </div>
    </div>
  );
};

export default Row;
