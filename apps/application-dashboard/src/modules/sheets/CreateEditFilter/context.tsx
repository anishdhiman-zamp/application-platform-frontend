'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { ComboboxOption } from '@zamp-platform/ui';
import { CreateEditFilterContextType, DataType, FormDataType } from 'modules/sheets/CreateEditFilter/types';
import { useSearchParams } from 'next/navigation';

export const defaultFormData: FormDataType = {
  name: 'New Filter',
  columnAndDatasetList: [],
  datatype: DataType.STRING,
  id: undefined,
};

const CreateEditFilterContext = createContext<CreateEditFilterContextType | undefined>(undefined);

export const useCreateEditFilterContext = () => {
  const context = useContext(CreateEditFilterContext);

  if (!context) {
    throw new Error('useCreateEditFilterContext must be used within a CreateEditFilterProvider');
  }

  return context;
};

interface CreateEditFilterProviderProps {
  children: ReactNode;
}

export const CreateEditFilterProvider = ({ children }: CreateEditFilterProviderProps) => {
  const searchParams = useSearchParams();

  const datasetIdAndWidgetsMapping: Record<string, string[]> = useMemo(
    () => JSON.parse(searchParams?.get('datasetIdAndWidgetsMapping') || '{}'),
    [searchParams?.get('datasetIdAndWidgetsMapping')],
  );

  const [formData, setFormDataState] = useState<FormDataType>(defaultFormData);
  const [datasetOptions, setDatasetOptions] = useState<ComboboxOption[]>([]);
  const [existingFiltersFormData, setExistingFiltersFormData] = useState<FormDataType[]>([]);
  const [isSearchFilter, setIsSearchFilter] = useState(false);

  const setFormData = useCallback((data: Partial<FormDataType>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  const contextValue: CreateEditFilterContextType = {
    formData,
    setFormData,
    datasetIdAndWidgetsMapping,
    datasetOptions,
    setDatasetOptions,
    existingFiltersFormData,
    setExistingFiltersFormData,
    isSearchFilter,
    setIsSearchFilter,
  };

  return <CreateEditFilterContext.Provider value={contextValue}>{children}</CreateEditFilterContext.Provider>;
};
