import type { FC, RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { DATE_FORMATS } from '@zamp-platform/utils';
import DisplayField from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/DisplayField';
import EditableField from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/EditableField';
import { artifactContextActions, useArtifactContextStore } from 'modules/process/artifacts/context/artifact.context';
import type { CompletedField } from 'modules/process/artifacts/context/completedFields.context';
import type { DatasetFilterConfigResponseType } from 'types/api/dataset.types';
import type { MapAny } from 'types/commonTypes';
import type { ColumnDef } from '@/components/common/agGridTable/AgGridTable';
import { VALUE_FORMAT_TYPE } from '@/components/common/table/table.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { COLORS } from '@/constants/colors';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
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
  completedFields: CompletedField[];
  currentUserHasEditAccess: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  selectedKeyRef: RefObject<HTMLDivElement | null>;
  onValueClick?: (rowIndex: string, column: string) => void;
  clickedField: string;
  setClickedField: (field: string) => void;
  datasetId: string;
  showPdfSearch?: boolean;
  filterConfig?: DatasetFilterConfigResponseType[];
  rowData: MapAny;
  isPdfDataset?: boolean;
}

const Row: FC<RowProps> = ({
  keyValue: [key, value],
  rowId,
  selectedKey,
  columns,
  onChange,
  missingFields = [],
  requiredMissingFields = [],
  completedFields = [],
  currentUserHasEditAccess,
  textareaRef,
  selectedKeyRef,
  onValueClick,
  clickedField,
  setClickedField,
  datasetId,
  showPdfSearch,
  filterConfig = [],
  rowData,
  isPdfDataset = false,
}) => {
  const { dispatch } = useArtifactContextStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState('');

  const fieldId = `${rowId}-${key}`;
  const isSelected = selectedKey === key;
  const isClicked = clickedField === fieldId;
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const column = useMemo(() => columns.find((col) => col?.field === key), [columns, key]);
  const columnConfig = useMemo(() => filterConfig.find((col) => col?.column === key), [filterConfig, key]);

  const isColumnVisible =
    getColumnOrderingVisibilityForCurrentDataset(datasetId).find((col) => col?.colId === key)?.isVisible ?? true;

  const valueFormatter = useMemo(() => (columnConfig ? getValueFormatter(columnConfig) : undefined), [columnConfig]);

  const formattedValue = useMemo(() => {
    if (columnConfig?.type === FILTER_TYPES.DATE_RANGE && !columnConfig?.metadata?.config?.value_format) {
      return getFormattedDate({ type: VALUE_FORMAT_TYPE.DATE_TIME, value: DATE_FORMATS.ddMMMyyyy }, value) as string;
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
      completedFields.some((field) => field?.columnId === key && field?.rowId === rowId) &&
      !isValueEmpty(value) &&
      missingFields.some((field) => field?.column === key && field?.id === rowId),
    [completedFields, key, rowId, value, missingFields],
  );

  const shouldShowInputDirectly = isEditable && isValueEmpty(value);

  useEffect(() => {
    setEditingValue(formattedValue);
  }, [formattedValue]);

  useEffect(() => {
    if (isEditing) {
      editTextareaRef.current?.focus();
    }
  }, [isEditing]);

  const handleSearch = () => {
    dispatch({
      type: artifactContextActions.SET_SEARCH_TERM,
      payload: { searchTerm: value },
    });
  };

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

      {showPdfSearch && (
        <Button
          variant='outline'
          size='icon'
          className='hover:bg-GRAY_200 absolute right-4 bottom-4 h-6 w-6 rounded-sm !px-2.5 !py-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100'
          onClick={(e) => {
            e.stopPropagation();
            handleSearch();
          }}
        >
          <TooltipV2 tooltipBody='Search in PDF'>
            <SvgSpriteLoader id='search-sm' size={10} color={COLORS.GRAY_1000} className='cursor-pointer' />
          </TooltipV2>
        </Button>
      )}
    </div>
  );
};

export default Row;
