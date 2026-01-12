import { Input, Switch } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';
import React, { FC, memo, useRef } from 'react';

import { DATASET_COLUMN_HEADERS_LIST, DatasetColumnHeaderTypes } from '../constants';
import { useDatasetColumnDetails } from '../hooks/useDatasetColumnDetails';
import ColumnTypeDropdown from './ColumnTypeDropdown';

export interface ColumnDataType {
  id: string;
  column_name: string;
  column_type: string;
  required: boolean;
}

interface IDatasetColumDetailsProps {
  columnData: ColumnDataType;
  onChange: (id: string, field: DatasetColumnHeaderTypes, value: string | boolean) => void;
  onDelete: (id: string) => void;
  onColumnNameBlur?: (id: string, columnName: string) => void;
  shouldAutoFocus?: boolean;
}

const DatasetColumDetails: FC<IDatasetColumDetailsProps> = memo(
  ({ columnData, onChange, onDelete, onColumnNameBlur, shouldAutoFocus = false }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const {
      attributes,
      listeners,
      setNodeRef,
      style,
      isDragging,
      handleNameChange,
      handleTypeChange,
      handleRequiredChange,
    } = useDatasetColumnDetails({ columnData, onChange });

    const cellContentMap: Record<DatasetColumnHeaderTypes, React.ReactNode> = {
      [DatasetColumnHeaderTypes.COLUMN_NAME]: (
        <div className='mr-16 flex w-full items-center gap-2 pr-4'>
          <div {...attributes} {...listeners} className='flex-shrink-0 cursor-grab touch-none'>
            <GripVertical className='text-GRAY_500 h-4 w-4' />
          </div>
          <div className='flex flex-1 items-center gap-2'>
            <Input
              ref={(el) => {
                inputRef.current = el;
              }}
              placeholder='Column Name'
              className='h-8 w-full flex-1'
              value={columnData.column_name}
              onChange={handleNameChange}
              onBlur={() => {
                if (onColumnNameBlur) {
                  onColumnNameBlur(columnData.id, columnData.column_name);
                }
              }}
            />
          </div>
        </div>
      ),
      [DatasetColumnHeaderTypes.COLUMN_TYPE]: (
        <div className='w-full pr-4 pl-2'>
          <ColumnTypeDropdown
            selectedType={columnData.column_type}
            onTypeSelect={handleTypeChange}
            selectedClassName='bg-GRAY_50 border-none'
            triggerClassName='px-1.5 py-1 h-6 f-12-450 text-GRAY_1000'
          />
        </div>
      ),
      [DatasetColumnHeaderTypes.REQUIRED]: (
        <div className='flex w-full items-center pl-2'>
          <Switch
            checked={columnData.required}
            onCheckedChange={handleRequiredChange}
            className='h-3.5 w-6'
            thumbClassName='h-2.5 w-2.5 data-[state=checked]:translate-x-2.5'
          />
        </div>
      ),
      [DatasetColumnHeaderTypes.ACTIONS]: (
        <div className='w-full flex-1 justify-end'>
          <Trash2
            className='text-GRAY_700 hover:text-GRAY_900 h-4 w-4 cursor-pointer'
            onClick={() => onDelete(columnData.id)}
          />
        </div>
      ),
    };

    const handleAnimationComplete = () => {
      if (shouldAutoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    };

    return (
      <div ref={setNodeRef} style={{ ...style, zIndex: isDragging ? 999 : undefined }}>
        <motion.div
          className='border-GRAY_100 flex origin-top items-center justify-between overflow-hidden border-b bg-white py-2.5 pr-4 pl-3.5'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.15, 0.0, 0.4, 1.0] } }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: [0.15, 0.0, 0.4, 1.0] } }}
          onAnimationComplete={handleAnimationComplete}
        >
          {DATASET_COLUMN_HEADERS_LIST.map((header) => (
            <div
              key={header.value}
              className={cn('f-12-450 text-GRAY_700 flex items-center', !header.width && 'flex-1 overflow-hidden')}
              style={header.width ? { width: header.width, flex: 'none' } : {}}
            >
              {cellContentMap[header.value as DatasetColumnHeaderTypes]}
            </div>
          ))}
        </motion.div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the data for THIS specific column changed
    return (
      prevProps.columnData.id === nextProps.columnData.id &&
      prevProps.columnData.column_name === nextProps.columnData.column_name &&
      prevProps.columnData.column_type === nextProps.columnData.column_type &&
      prevProps.columnData.required === nextProps.columnData.required &&
      prevProps.shouldAutoFocus === nextProps.shouldAutoFocus
    );
  },
);

DatasetColumDetails.displayName = 'DatasetColumDetails';

export default DatasetColumDetails;
