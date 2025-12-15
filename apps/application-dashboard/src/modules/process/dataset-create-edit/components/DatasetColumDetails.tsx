import React, { FC } from 'react';
import { Input, Switch } from '@zamp-platform/ui';
import { GripVertical, Trash2 } from 'lucide-react';
import ColumnTypeDropdown from 'modules/process/dataset-create-edit/components/ColumnTypeDropdown';
import { useDatasetColumnDetails } from 'modules/process/dataset-create-edit/hooks/useDatasetColumnDetails';
import { DATASET_COLUMN_HEADERS_LIST } from 'modules/process/process.constant';
import { ColumnDataType, DatasetColumnHeaderTypes } from 'modules/process/process.types';
import { cn } from '@/utils/common';

interface IDatasetColumDetailsProps {
  columnData: ColumnDataType;
  onChange: (id: string, field: DatasetColumnHeaderTypes, value: string | boolean) => void;
  onDelete: (id: string) => void;
}

const DatasetColumDetails: FC<IDatasetColumDetailsProps> = ({ columnData, onChange, onDelete }) => {
  const { attributes, listeners, setNodeRef, style, handleNameChange, handleTypeChange, handleRequiredChange } =
    useDatasetColumnDetails({ columnData, onChange });

  const cellContentMap: Record<DatasetColumnHeaderTypes, React.ReactNode> = {
    [DatasetColumnHeaderTypes.COLUMN_NAME]: (
      <div className='mr-16 flex w-full items-center gap-2 pr-4'>
        <div {...attributes} {...listeners} className='flex-shrink-0 cursor-grab touch-none'>
          <GripVertical className='text-GRAY_400 text-GRAY_500 h-4 w-4' />
        </div>
        <div className='flex-1'>
          <Input
            placeholder='Column Name'
            className='h-9 w-full flex-1'
            value={columnData.column_name}
            onChange={handleNameChange}
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
          triggerClassName='px-1.5 py-1 f-12-450 text-GRAY_1000'
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='border-GRAY_100 flex items-center justify-between border-b bg-white py-2.5 pr-4 pl-3.5'
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
    </div>
  );
};

export default DatasetColumDetails;
