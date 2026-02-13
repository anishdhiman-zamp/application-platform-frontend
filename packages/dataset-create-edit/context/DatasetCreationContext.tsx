import React, { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from 'react';

import type { ColumnDataType } from '../components/DatasetColumDetails';
import { DatasetColumnTypes } from '../constants';

interface DatasetCreationContextType {
  columns: ColumnDataType[];
  handleColumnChange: (id: string, field: string, value: string | boolean) => void;
  handleDeleteColumn: (id: string) => void;
  handleAddColumn: (type: string) => void;
  setColumns: Dispatch<SetStateAction<ColumnDataType[]>>;
}

const DatasetCreationContext = createContext<DatasetCreationContextType | undefined>(undefined);

export const useDatasetCreationContext = () => {
  const context = useContext(DatasetCreationContext);

  if (!context) {
    throw new Error('useDatasetCreationContext must be used within DatasetCreationProvider');
  }

  return context;
};

interface DatasetCreationProviderProps {
  children: ReactNode;
}

export const DatasetCreationProvider: FC<DatasetCreationProviderProps> = ({ children }) => {
  const [columns, setColumns] = useState<ColumnDataType[]>([
    { id: '1', column_name: '', column_type: DatasetColumnTypes.TEXT, required: false },
  ]);

  const handleColumnChange = (id: string, field: string, value: string | boolean) => {
    setColumns((prev) => prev.map((col) => (col?.id === id ? { ...col, [field]: value } : col)));
  };

  const handleDeleteColumn = (id: string) => {
    setColumns((prev) => prev.filter((col) => col?.id !== id));
  };

  const handleAddColumn = (type: string) => {
    const newColumn: ColumnDataType = {
      id: crypto.randomUUID(),
      column_name: '',
      column_type: type as DatasetColumnTypes,
      required: false,
    };

    setColumns((prev) => [...prev, newColumn]);
  };

  const value = {
    columns,
    handleColumnChange,
    handleDeleteColumn,
    handleAddColumn,
    setColumns,
  };

  return <DatasetCreationContext.Provider value={value}>{children}</DatasetCreationContext.Provider>;
};
