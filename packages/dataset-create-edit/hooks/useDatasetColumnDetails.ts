import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import type { ColumnDataType } from '../components/DatasetColumDetails';
import { DatasetColumnHeaderTypes } from '../constants';

interface UseDatasetColumnDetailsProps {
  columnData: ColumnDataType;
  onChange: (id: string, field: DatasetColumnHeaderTypes, value: string | boolean) => void;
}

export const useDatasetColumnDetails = ({ columnData, onChange }: UseDatasetColumnDetailsProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: columnData.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(columnData.id, DatasetColumnHeaderTypes.COLUMN_NAME, e.target.value);
  };

  const handleTypeChange = (type: string) => {
    // If type changed, reset required to false and default to null
    if (type !== columnData?.column_type) {
      onChange(columnData?.id, DatasetColumnHeaderTypes.REQUIRED, false);
      onChange(columnData?.id, 'default' as DatasetColumnHeaderTypes, null as unknown as string);
    }
    onChange(columnData?.id, DatasetColumnHeaderTypes.COLUMN_TYPE, type);
  };

  const handleRequiredChange = (checked: boolean) => {
    onChange(columnData?.id, DatasetColumnHeaderTypes.REQUIRED, checked);
  };

  const handleVisibilityChange = () => {
    onChange(columnData?.id, DatasetColumnHeaderTypes.HIDDEN, !columnData?.isVisible);
  };

  return {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
    handleNameChange,
    handleTypeChange,
    handleRequiredChange,
    handleVisibilityChange,
  };
};
