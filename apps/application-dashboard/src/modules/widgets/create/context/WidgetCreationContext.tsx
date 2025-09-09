'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { DatasetColumn, WidgetCreationContextType, WidgetCreationFormData } from 'modules/widgets/create/types';
import { getEditFormData } from 'modules/widgets/create/utils';
import { WidgetSize } from 'modules/widgets/widget.types';
import { useSearchParams } from 'next/navigation';
import { WIDGET_TYPES, WidgetDataType, WidgetInstanceType } from 'types/api/widgets.types';
import { LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { MapAny } from '@/types/commonTypes';

const WIDGET_CREATION_STORAGE_KEY = LOCAL_STORAGE_KEYS.WIDGET_CREATION_FORM_DATA;

export const defaultFormData: WidgetCreationFormData = {
  title: '',
  datasetId: '',
  visualizationType: WIDGET_TYPES.BAR_CHART,
  size: 'half',
  chartSpecificFields: {},
};

const WidgetCreationContext = createContext<WidgetCreationContextType | undefined>(undefined);

export const useWidgetCreationContext = () => {
  const context = useContext(WidgetCreationContext);

  if (!context) {
    throw new Error('useWidgetCreationContext must be used within a WidgetCreationProvider');
  }

  return context;
};

interface WidgetCreationProviderProps {
  children: ReactNode;
}

export const WidgetCreationProvider = ({ children }: WidgetCreationProviderProps) => {
  const searchParams = useSearchParams();

  const data = JSON.parse(atob(searchParams?.get('data') ?? '') || '{}');
  const size = searchParams?.get('size') as WidgetSize;
  const { editFormData, preSelectedFilters } = getEditFormData(data, size);

  const [formData, setFormDataState] = useState<WidgetCreationFormData>(editFormData ?? defaultFormData);
  const [previewData, setPreviewData] = useState<WidgetDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [datasetColumns, setDatasetColumns] = useState<DatasetColumn[]>([]);
  const [mockWidgetDetails, setMockWidgetDetails] = useState<WidgetInstanceType>();
  const [mockData, setMockData] = useState<MapAny[]>([]);

  const setFormData = useCallback((data: Partial<WidgetCreationFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(WIDGET_CREATION_STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to save widget creation data to localStorage:', error);
    }
  }, [formData]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(WIDGET_CREATION_STORAGE_KEY);

      if (stored) {
        const parsedData = JSON.parse(stored);

        setFormDataState(parsedData);

        return parsedData;
      }
    } catch (error) {
      console.error('Failed to load widget creation data from localStorage:', error);
    }

    return null;
  }, []);

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(WIDGET_CREATION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear widget creation data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const contextValue: WidgetCreationContextType = {
    formData,
    setFormData,
    previewData,
    setPreviewData,
    isLoading,
    setIsLoading,
    datasetColumns,
    setDatasetColumns,
    saveToLocalStorage,
    clearLocalStorage,
    mockWidgetDetails,
    setMockWidgetDetails,
    mockData,
    setMockData,
    editWidgetInstanceId: data?.widget_instance_id,
    preSelectedFilters,
  };

  return <WidgetCreationContext.Provider value={contextValue}>{children}</WidgetCreationContext.Provider>;
};
