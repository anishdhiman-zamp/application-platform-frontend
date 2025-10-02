import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import { TOOLTIP_TEXT } from 'modules/sheets/CreateEditFilter/constants';
import { defaultFormData, useCreateEditFilterContext } from 'modules/sheets/CreateEditFilter/context';
import { FormDataType } from 'modules/sheets/CreateEditFilter/types';
import { formatEditFilterDataToFormData, formatFormDataForCreate } from 'modules/sheets/CreateEditFilter/utils';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  useCreateSheetFilterConfigMutation,
  useGetSheetFilterConfigQuery,
  useUpdateSheetFilterConfigMutation,
} from '@/apis/pages';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { filtersContextActions, useFiltersContextStore } from '@/components/filter/filters.context';
import { useAppDispatch } from '@/hooks/toolkit';
import useUpdateDatasetIds from '@/hooks/useUpdateDatasetIds';
import { setNewFilterId } from '@/store/slices/sheet-filters';
import { checkIsObjectEmpty } from '@/utils/common';
import { LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const useCreateEditFilter = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const updateDatasetIds = useUpdateDatasetIds();
  const appDispatch = useAppDispatch();

  const isFilterOpen = searchParams?.get('isFilterOpen') === 'true';
  const filterId = searchParams?.get('filterId');

  const [existingFilterData, setExistingFilterData] = useState<FormDataType>();

  const {
    formData,
    datasetIdAndWidgetsMapping,
    setFormData,
    setExistingFiltersFormData,
    existingFiltersFormData,
    setIsSearchFilter,
    isSearchFilter,
  } = useCreateEditFilterContext();

  const {
    dispatch,
    state: { selectedFilters, filtersConfig },
  } = useFiltersContextStore();

  const [createSheetFilterConfig, { isLoading: isCreatingFilter }] = useCreateSheetFilterConfigMutation();
  const [updateSheetFilterConfig, { isLoading: isUpdatingFilter }] = useUpdateSheetFilterConfigMutation();
  const { data: sheetFilterConfig } = useGetSheetFilterConfigQuery(
    {
      pageId: params?.pageId as string,
      sheetId: params?.sheetId as string,
    },
    {
      skip: !params?.pageId || !params?.sheetId,
      refetchOnMountOrArgChange: false,
    },
  );

  const createEditFilterFormDataLS = useMemo(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.CREATE_EDIT_FILTER_FORM_DATA);

      return JSON.parse(storedData || '{}');
    }
  }, [window]);

  const { isSubmitDisabled, tooltipText } = useMemo(() => {
    let isSubmitDisabled = false;
    let tooltipText = '';

    if (formData.columnAndDatasetList?.length === 0) {
      isSubmitDisabled = true;
      tooltipText = TOOLTIP_TEXT.SELECT_DATASET;
    } else if (formData.columnAndDatasetList.some((item) => item.columns.length === 0)) {
      isSubmitDisabled = true;
      tooltipText = TOOLTIP_TEXT.SELECT_AT_LEAST_ONE_COLUMN;
    }

    return { isSubmitDisabled, tooltipText };
  }, [formData]);

  const filter = useMemo(
    () => sheetFilterConfig?.native_filter_config?.find((filter) => filter.id === filterId),
    [sheetFilterConfig, filterId],
  );

  const handleClose = (filterId?: string) => {
    if (typeof filterId === 'string') {
      appDispatch(setNewFilterId(filterId));
    }
    updateDatasetIds([]);
    router.push(`?`);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Store the new timeout ID in ref
    timeoutRef.current = setTimeout(() => {
      dispatch({
        type: filtersContextActions.SET_FILTERS_CONFIG,
        payload: {
          filtersConfig: [],
        },
      });
      dispatch({
        type: filtersContextActions.RESET_ALL_FILTERS,
      });
      setFormData(defaultFormData);
      setExistingFilterData(undefined);
      timeoutRef.current = null; // Clear the ref after execution
    }, 1000);
  };

  const handleCreateFilter = () => {
    if (isSubmitDisabled) return;

    const { payload, filterId } = formatFormDataForCreate({
      formData,
      datasetIdAndWidgetsMapping,
      selectedFilters,
      filtersConfig,
      isSearchFilter,
    });

    const pageId = params?.pageId as string;
    const sheetId = params?.sheetId as string;

    if (filterId) {
      updateSheetFilterConfig({
        pageId,
        sheetId,
        filterId,
        body: payload,
      })
        .unwrap()
        .then(() => handleClose(filterId))
        .catch(() => {
          toast.error(`Failed to update ${formData.name} filter`);
        });
    } else {
      createSheetFilterConfig({
        pageId,
        sheetId,
        body: payload,
      })
        .unwrap()
        .then((res) => handleClose(res.data.id))
        .catch(() => {
          toast.error(`Failed to create ${formData.name} filter`);
        });
    }
  };

  const handleExistingFilterNo = () => {
    setExistingFilterData(undefined);
    setExistingFiltersFormData([]);
  };

  const handleExistingFilterYes = () => {
    const filterId = existingFilterData?.id;

    setExistingFilterData(undefined);
    router.push(
      `?isFilterOpen=true&datasetIdAndWidgetsMapping=${JSON.stringify(datasetIdAndWidgetsMapping)}&filterId=${filterId}`,
    );
  };

  const setupEditFilterData = useCallback(() => {
    if (!filter || checkIsObjectEmpty(filter)) return;
    const { editFormData, selectedDatasetIds, filtersConfig, selectedFilters } = formatEditFilterDataToFormData(filter);

    setFormData(editFormData);
    dispatch({
      type: filtersContextActions.SET_FILTERS_CONFIG,
      payload: {
        filtersConfig,
      },
    });
    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: {
        selectedFilters,
      },
    });

    updateDatasetIds(selectedDatasetIds);
  }, [filter, setFormData, dispatch, updateDatasetIds]);

  const setupExistingFiltersFormData = useCallback(() => {
    if (!sheetFilterConfig?.native_filter_config?.length) {
      setExistingFiltersFormData([]);

      return;
    }

    const existingFiltersFormData = sheetFilterConfig?.native_filter_config?.map(
      (filter) => formatEditFilterDataToFormData(filter).editFormData,
    );

    setExistingFiltersFormData(existingFiltersFormData);
  }, [sheetFilterConfig, setExistingFiltersFormData]);

  const setupExistingFilterData = useCallback(() => {
    if ((formData?.id && formData?.id === filterId) || !existingFiltersFormData?.length) return;

    let updatedExistingFiltersFormData: FormDataType | undefined;

    for (const filter of existingFiltersFormData) {
      for (const columnAndDatasetList of filter.columnAndDatasetList) {
        const config = formData.columnAndDatasetList.find((item) => item.datasetId === columnAndDatasetList.datasetId);

        if (
          config &&
          config.columns.length === columnAndDatasetList.columns.length &&
          config.columns.every((column) => columnAndDatasetList.columns.includes(column))
        ) {
          updatedExistingFiltersFormData = filter;
          break;
        }
      }
    }
    setExistingFilterData(updatedExistingFiltersFormData);
  }, [formData, existingFiltersFormData]);

  const updateIsSearchFilter = useCallback(() => {
    let isSearchFilter = false;

    for (const columnAndDatasetList of formData.columnAndDatasetList) {
      if (columnAndDatasetList.filterType === FILTER_TYPES.SEARCH) {
        isSearchFilter = true;
        break;
      }
    }

    setIsSearchFilter(isSearchFilter);
  }, [formData]);

  const saveToLocalStorage = useCallback(() => {
    if (!params?.sheetId || typeof window === 'undefined') return;

    const updatedData = {
      ...createEditFilterFormDataLS,
      [params?.sheetId as string]: {
        formData,
        selectedFilters,
        filtersConfig,
      },
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.CREATE_EDIT_FILTER_FORM_DATA, JSON.stringify(updatedData));
  }, [formData, selectedFilters, filtersConfig, params?.sheetId, createEditFilterFormDataLS]);

  const loadFromLocalStorage = useCallback(() => {
    const currentSheetData = createEditFilterFormDataLS?.[params?.sheetId as string];

    if (checkIsObjectEmpty(currentSheetData)) return;

    setFormData(currentSheetData?.formData);
    dispatch({
      type: filtersContextActions.SET_FILTERS_CONFIG,
      payload: { filtersConfig: currentSheetData?.filtersConfig },
    });
    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: { selectedFilters: currentSheetData?.selectedFilters },
    });
  }, [setFormData, dispatch, createEditFilterFormDataLS, params?.sheetId]);

  useEffect(setupEditFilterData, [filter]);

  useEffect(setupExistingFiltersFormData, [sheetFilterConfig, isFilterOpen]);

  useEffect(setupExistingFilterData, [formData, existingFiltersFormData]);

  useEffect(updateIsSearchFilter, [formData]);

  useEffect(loadFromLocalStorage, [params?.sheetId]);

  useEffect(saveToLocalStorage, [formData, selectedFilters, filtersConfig, isFilterOpen]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    formData,
    handleCreateFilter,
    handleClose,
    isFilterOpen,
    isLoading: isCreatingFilter || isUpdatingFilter,
    existingFilterData,
    isSubmitDisabled,
    tooltipText,
    handleExistingFilterNo,
    handleExistingFilterYes,
  };
};

export default useCreateEditFilter;
