import React, { FC, ReactNode, useEffect } from 'react';
import { useGetSheetFilterConfigQuery } from 'apis/pages';
import { getDefaultFilterValues, getFormattedSheetsFiltersConfig } from 'modules/sheets/sheets.utils';
import { LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { useAppSelector } from '@/hooks/toolkit';
import { MapAny } from '@/types/commonTypes';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

const InitializeSheetsFilters: FC<{ children: ReactNode; pageId: string; sheetId: string }> = ({
  children,
  pageId,
  sheetId,
}) => {
  const { data: sheetFilterConfig, isSuccess } = useGetSheetFilterConfigQuery(
    { pageId: pageId as string, sheetId: sheetId as string },
    { skip: !sheetId, refetchOnMountOrArgChange: false },
  );
  const {
    dispatch,
    state: { selectedFiltersInUI, allSelectedFilters },
  } = useFiltersContextStore();
  const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID) || '{}');
  const currentSheetLSFilters = storedData[sheetId]?.selectedFiltersInUI;
  const currentSheetLSAllSelectedFilters = storedData[sheetId]?.allSelectedFilters;
  const defaultFilterValues = getDefaultFilterValues(sheetFilterConfig?.native_filter_config || []);

  const newFilterId = useAppSelector((state) => state.sheetFilters.newFilterId);

  const storeUiFiltersToLocalStorage = () => {
    if (!sheetId || typeof sheetId !== 'string') return;

    localStorage.setItem(
      LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID,
      JSON.stringify({
        ...storedData,
        [sheetId]: {
          selectedFiltersInUI,
          allSelectedFilters,
        },
      }),
    );
  };

  const initializeFilters = () => {
    const localStorageFilters = currentSheetLSFilters ?? {};
    const allSelectedFiltersKeysLS = currentSheetLSAllSelectedFilters
      ? Object.keys(currentSheetLSAllSelectedFilters)
      : [];
    const selectedFiltersKeysLS = Object.keys(localStorageFilters);

    const updatedSelectedFilters: MapAny = {};

    Object.entries(defaultFilterValues).forEach(([key, value]) => {
      if (
        (!allSelectedFiltersKeysLS.includes(key) && !selectedFiltersKeysLS.includes(key)) ||
        (newFilterId && key === newFilterId)
      ) {
        updatedSelectedFilters[key] = value;
      }
    });

    const updatedFilters = { ...defaultFilterValues, ...localStorageFilters };
    const emptyFilters: MapAny = {};

    if (sheetFilterConfig?.native_filter_config?.length) {
      const filtersConfig = sheetFilterConfig?.native_filter_config;

      // get filters from localStorage for the current sheetId
      const filters = filtersConfig.map((filter) => {
        if (filter?.id) {
          emptyFilters[filter.id] = null;
        }

        return getFormattedSheetsFiltersConfig(filter);
      });

      const selectedEmptyFilters: MapAny = {};

      if (newFilterId && newFilterId in emptyFilters) {
        selectedEmptyFilters[newFilterId] = null;
      }

      if (filters?.length) {
        dispatch({
          type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
          payload: {
            selectedFilters: { ...selectedEmptyFilters, ...updatedSelectedFilters, ...localStorageFilters },
            allSelectedFilters: { ...emptyFilters, ...currentSheetLSAllSelectedFilters, ...updatedFilters },
          },
        });

        dispatch({
          type: filtersContextActions.SET_INITIALISED,
        });

        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig: filters,
          },
        });
      } else {
        dispatch({
          type: filtersContextActions.SET_INITIALISED,
        });
      }
    } else {
      if (isSuccess) {
        dispatch({
          type: filtersContextActions.SET_INITIALISED,
        });
      }
      dispatch({
        type: filtersContextActions.SET_FILTERS_CONFIG,
        payload: { filtersConfig: [] },
      });
      dispatch({
        type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
      });
    }
  };

  useEffect(() => {
    if (Object.keys(selectedFiltersInUI).length > 0) {
      storeUiFiltersToLocalStorage();
    }
  }, [selectedFiltersInUI]);

  useEffect(() => {
    if (sheetId && sheetFilterConfig) {
      initializeFilters();
    }
  }, [sheetFilterConfig, sheetId]);

  return <div>{children}</div>;
};

export default InitializeSheetsFilters;
