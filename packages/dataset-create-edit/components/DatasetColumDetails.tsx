import { Input, Switch, toast, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';
import React, { FC, memo, useEffect, useRef, useState } from 'react';

import { DATASET_COLUMN_HEADERS_LIST, DATASET_TOAST_MESSAGES, DatasetColumnHeaderTypes } from '../constants';
import { useDatasetColumnDetails } from '../hooks/useDatasetColumnDetails';
import ColumnTypeDropdown from './ColumnTypeDropdown';
import DeleteColumnConfirmation from './DeleteColumnConfirmation';
import RequiredDefaultValueModal from './RequiredDefaultValueModal';

export interface ColumnDataType {
  id: string;
  column_name: string;
  column_type: string;
  required: boolean;
  isVisible?: boolean;
  default?: string | boolean | null;
}

interface IDatasetColumDetailsProps {
  columnData: ColumnDataType;
  onChange: (id: string, field: DatasetColumnHeaderTypes, value: string | boolean | null) => void;
  onDelete: (id: string) => void;
  onColumnNameBlur?: (id: string, columnName: string) => void;
  shouldAutoFocus?: boolean;
  allColumns?: ColumnDataType[]; // All columns to check for duplicates
  skipInitialAnimation?: boolean; // Skip animation for default/initial column
  canEdit?: boolean; // Whether the user can edit this column (admin/editor or creation mode)
}

const DatasetColumDetails: FC<IDatasetColumDetailsProps> = memo(
  ({
    columnData,
    onChange,
    onDelete,
    onColumnNameBlur,
    shouldAutoFocus = false,
    allColumns = [],
    skipInitialAnimation = false,
    canEdit = true,
  }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [localColumnName, setLocalColumnName] = useState<string>(columnData?.column_name || '');

    const { attributes, listeners, setNodeRef, style, isDragging, handleTypeChange, handleVisibilityChange } =
      useDatasetColumnDetails({ columnData, onChange });

    // Custom handleNameChange that preserves spaces
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalColumnName(newValue);
      onChange(columnData?.id, DatasetColumnHeaderTypes.COLUMN_NAME, newValue);
    };

    // Validation logic for column name
    const getColumnNameError = (): string | null => {
      // Use localColumnName for validation to catch errors in real-time
      const trimmedName = localColumnName?.trim() || '';

      // Check if empty
      if (!trimmedName) {
        return DATASET_TOAST_MESSAGES.COLUMN_NAME_EMPTY;
      }

      // Check for duplicates (case-insensitive)
      // Only show error on the latest created column (the one that appears last in the array)
      const normalizedName = trimmedName.toLowerCase();
      const currentColumnIndex = allColumns.findIndex((col) => col?.id === columnData?.id);

      // Find all columns with the same name (including current)
      // Compare using localColumnName for current column, others use their column_name
      const columnsWithSameName = allColumns
        .map((col, index) => ({ col, index }))
        .filter(({ col }) => {
          const colName = col?.id === columnData?.id ? localColumnName : col?.column_name;
          return colName?.toLowerCase().trim() === normalizedName;
        });

      // If there are duplicates (more than one column with the same name)
      if (columnsWithSameName.length > 1) {
        // Find the column that appears last in the array (latest created)
        const latestDuplicate = columnsWithSameName.reduce((latest, current) =>
          current.index > latest.index ? current : latest,
        );

        // Only show error on the column that appears last (latest created)
        if (currentColumnIndex === latestDuplicate.index) {
          return DATASET_TOAST_MESSAGES.DUPLICATE_COLUMN_NAME;
        }
      }

      return null;
    };

    const columnNameError = getColumnNameError();

    // Handle required toggle - always opens modal when clicked
    // The actual state change only happens when user confirms or dismisses
    const handleRequiredToggle = () => {
      setIsModalOpen(true);
    };

    // Handle modal confirm - set required to true with default value
    const handleModalConfirm = (defaultValue: string) => {
      onChange(columnData?.id, DatasetColumnHeaderTypes.REQUIRED, true);
      onChange(columnData?.id, 'default' as DatasetColumnHeaderTypes, defaultValue);
      setIsModalOpen(false);
    };

    // Handle modal close - just closes modal without changing state
    // This is called when user clicks close button (X) or outside the modal
    const handleModalClose = () => {
      setIsModalOpen(false);
    };

    // Handle modal dismiss - closes modal AND sets required to false
    // This is only called when user clicks the "Dismiss" button
    const handleModalDismiss = () => {
      onChange(columnData?.id, DatasetColumnHeaderTypes.REQUIRED, false);
      onChange(columnData?.id, 'default' as DatasetColumnHeaderTypes, null);
      setIsModalOpen(false);
    };

    const cellContentMap: Record<DatasetColumnHeaderTypes, React.ReactNode> = {
      [DatasetColumnHeaderTypes.GRIP]: (
        <div {...listeners} {...attributes} className='flex-shrink-0 cursor-grab touch-none'>
          <GripVertical className='text-GRAY_500 h-4 w-4' />
        </div>
      ),
      [DatasetColumnHeaderTypes.COLUMN_NAME]: (
        <div className='mr-12 flex w-full min-w-0 flex-col gap-1'>
          <div className='flex w-full min-w-0 items-center gap-2'>
            <Input
              ref={(el) => {
                inputRef.current = el;
              }}
              placeholder='Column Name'
              className={cn(
                'text-GRAY_1000 h-8 min-w-0',
                columnNameError && 'focus:border-RED_700 focus:shadow-[0px_0px_0px_3px_var(--RED_700)] focus:ring-0',
              )}
              wrapperClassName='flex-1 min-w-0'
              error={!!columnNameError}
              value={localColumnName}
              onChange={handleNameChange}
              disabled={!canEdit}
              onKeyDown={(e) => {
                // Stop drag and drop from interfering with input keyboard events
                e.stopPropagation();
              }}
              onBlur={() => {
                if (onColumnNameBlur) {
                  onColumnNameBlur(columnData.id, localColumnName);
                }
              }}
            />
          </div>
        </div>
      ),
      [DatasetColumnHeaderTypes.COLUMN_TYPE]: (
        <div className='w-full pr-4'>
          <ColumnTypeDropdown
            label='Columns'
            selectedType={columnData?.column_type}
            onTypeSelect={handleTypeChange}
            selectedClassName='bg-GRAY_50 border-none'
            triggerClassName='px-1.5 py-1 h-6 f-12-450 text-GRAY_1000'
            // disabled={!canEdit}
          />
        </div>
      ),
      [DatasetColumnHeaderTypes.REQUIRED]: (
        <div className='flex w-full items-center'>
          <Switch
            checked={columnData?.required}
            onCheckedChange={handleRequiredToggle}
            size='medium'
            disabled={!canEdit}
          />
        </div>
      ),
      [DatasetColumnHeaderTypes.HIDDEN]: (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                onClick={handleVisibilityChange}
                disabled={!canEdit}
                className='text-GRAY_600 hover:text-GRAY_900 flex cursor-pointer items-center gap-1.5 pr-4 pl-2 transition-colors disabled:cursor-not-allowed'
              >
                {columnData?.isVisible ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
              </button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='f-12-400'>
              {columnData?.isVisible ? 'Hide column' : 'Show column'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      [DatasetColumnHeaderTypes.ACTIONS]: (
        <div className='w-full flex-1 justify-end'>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => {
                    if (allColumns.length > 1) {
                      setIsDeleteDialogOpen(true);
                    }
                  }}
                  disabled={!canEdit}
                  className={cn(
                    'text-GRAY_600 flex cursor-pointer items-center gap-1.5 pr-4 pl-2 transition-colors disabled:cursor-not-allowed',
                    allColumns.length === 1
                      ? 'disabled:text-GRAY_300 hover:text-GRAY_300 cursor-not-allowed'
                      : 'hover:text-GRAY_900 cursor-pointer',
                  )}
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='f-12-400'>
                Delete column
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    };

    const handleAnimationComplete = () => {
      if (shouldAutoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    };

    const handleNoPermissionClick = () => {
      if (!canEdit) {
        toast.error(DATASET_TOAST_MESSAGES.NO_PERMISSION_TO_EDIT_DATASET);
      }
    };

    // Sync local state when columnData changes from external source (but not during typing)
    useEffect(() => {
      if (columnData.column_name !== localColumnName) {
        // Only update if the change didn't come from this input
        const trimmedLocal = localColumnName.trim();
        const trimmedColumnData = (columnData.column_name || '').trim();
        if (trimmedLocal === trimmedColumnData && localColumnName !== columnData.column_name) {
          // The external value is just a trimmed version of what we have - keep our local value
          return;
        }
        setLocalColumnName(columnData.column_name || '');
      }
    }, [columnData.column_name]);

    return (
      <>
        <div ref={setNodeRef} style={{ ...style, zIndex: isDragging ? 999 : undefined }}>
          <motion.div
            onClick={!canEdit ? handleNoPermissionClick : undefined}
            className={cn(
              'border-GRAY_100 flex origin-top items-center justify-between overflow-hidden border-b bg-white py-2.5 pr-8 pl-4',
              !canEdit && 'opacity-60',
            )}
            initial={skipInitialAnimation ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.15, 0.0, 0.4, 1.0] } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: [0.15, 0.0, 0.4, 1.0] } }}
            onAnimationComplete={handleAnimationComplete}
          >
            <div className='flex w-full flex-col items-start justify-start'>
              <div className='flex w-full items-center justify-between'>
                {DATASET_COLUMN_HEADERS_LIST.map((header) => (
                  <div
                    key={header.value}
                    className={cn(
                      'f-12-450 text-GRAY_700 flex items-start',
                      !header.width && 'min-w-0 flex-1',
                      !header?.width && header?.value !== DatasetColumnHeaderTypes.COLUMN_NAME && 'overflow-hidden',
                    )}
                    style={header?.width ? { width: header?.width, flex: 'none' } : {}}
                  >
                    {cellContentMap[header?.value as DatasetColumnHeaderTypes]}
                  </div>
                ))}
              </div>
              {columnNameError && <span className='f-11-400 text-RED_700 mt-2 ml-6 text-xs'>{columnNameError}</span>}
            </div>
          </motion.div>
        </div>

        {/* Required Default Value Modal */}
        <RequiredDefaultValueModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onDismiss={handleModalDismiss}
          onConfirm={handleModalConfirm}
          columnType={columnData.column_type}
          initialDefaultValue={columnData.default}
        />

        {/* Delete Column Confirmation Dialog */}
        <DeleteColumnConfirmation
          isOpen={isDeleteDialogOpen}
          columnName={columnData?.column_name}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={() => onDelete(columnData.id)}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the data for THIS specific column changed or allColumns changed (for validation)
    const prevColumnName = prevProps.columnData.column_name?.toLowerCase().trim();
    const nextColumnName = nextProps.columnData.column_name?.toLowerCase().trim();
    const prevAllColumnsNames =
      prevProps.allColumns?.map((col) => col.column_name?.toLowerCase().trim()).filter(Boolean) || [];
    const nextAllColumnsNames =
      nextProps.allColumns?.map((col) => col.column_name?.toLowerCase().trim()).filter(Boolean) || [];
    const allColumnsChanged = JSON.stringify(prevAllColumnsNames.sort()) !== JSON.stringify(nextAllColumnsNames.sort());

    return (
      prevProps.columnData.id === nextProps.columnData.id &&
      prevColumnName === nextColumnName &&
      prevProps.columnData.column_type === nextProps.columnData.column_type &&
      prevProps.columnData.required === nextProps.columnData.required &&
      prevProps.columnData.isVisible === nextProps.columnData.isVisible &&
      prevProps.shouldAutoFocus === nextProps.shouldAutoFocus &&
      !allColumnsChanged
    );
  },
);

DatasetColumDetails.displayName = 'DatasetColumDetails';

export default DatasetColumDetails;
