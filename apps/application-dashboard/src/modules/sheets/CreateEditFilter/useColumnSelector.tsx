import { useMemo, useState } from 'react';
import { ComboboxOption } from '@zamp-platform/ui';
import { useCreateEditFilterContext } from 'modules/sheets/CreateEditFilter/context';
import { ColumnAndDatasetListType } from 'modules/sheets/CreateEditFilter/types';
import { isDatatypeMatch } from 'modules/sheets/CreateEditFilter/utils';
import { useGetDatasetFilterConfigQuery } from '@/apis/dataset';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { filtersContextActions, useFiltersContextStore } from '@/components/filter/filters.context';
import useUpdateDatasetIds from '@/hooks/useUpdateDatasetIds';
import { snakeCaseToSentenceCase } from '@/utils/common';

const useColumnSelector = (config: ColumnAndDatasetListType) => {
  const updateDatasetIds = useUpdateDatasetIds();

  const [isOpen, setIsOpen] = useState(false);

  const { formData, setFormData, datasetOptions } = useCreateEditFilterContext();
  const {
    dispatch,
    state: { filtersConfig, selectedFilters },
  } = useFiltersContextStore();

  const { data: datasetFilterConfigData, isLoading: isLoadingDatasetFilterConfig } = useGetDatasetFilterConfigQuery(
    { datasetId: config.datasetId },
    { skip: !config.datasetId, refetchOnMountOrArgChange: false },
  );

  const columnOptions: ComboboxOption[] = useMemo(() => {
    return (
      datasetFilterConfigData?.data
        .filter(
          (column) =>
            !column?.metadata?.is_hidden &&
            isDatatypeMatch({
              datatype: column.datatype ?? '',
              datatypeToMatch: formData.datatype,
              customType: column.metadata?.custom_type,
            }),
        )
        .map((column) => ({
          label: column.alias ?? snakeCaseToSentenceCase(column.column),
          value: column.column,
        })) ?? []
    );
  }, [datasetFilterConfigData, formData.datatype]);

  const updateFiltersAndFormData = (newColumns: string[]) => {
    const columnConfigs =
      datasetFilterConfigData?.data.filter((column) => newColumns.some((option) => option === column.column)) ?? [];
    const newColumnAndDatasetList = [...formData.columnAndDatasetList];

    let filterType = columnConfigs?.[0]?.type;

    for (const columnConfig of columnConfigs) {
      if (columnConfig.type === FILTER_TYPES.SEARCH) {
        filterType = FILTER_TYPES.SEARCH;
        break;
      }
    }

    let index = -1;
    let otherOptions: string[] = [];

    for (let i = 0; i < newColumnAndDatasetList.length; i++) {
      if (newColumnAndDatasetList[i].datasetId === config.datasetId) {
        index = i;
        continue;
      }
      otherOptions = otherOptions.concat(newColumnAndDatasetList[i]?.options ?? []);
    }

    const datasetOptions = (columnConfigs?.map((column) => column.options) ?? []).flat();

    const options = Array.from(new Set([...datasetOptions, ...otherOptions]));

    if (index !== -1) {
      newColumnAndDatasetList[index].columns = newColumns;
      newColumnAndDatasetList[index].filterType = filterType;
      newColumnAndDatasetList[index].options = datasetOptions;
    }

    const dataType = columnConfigs?.[0]?.datatype;

    dispatch({
      type: filtersContextActions.SET_FILTERS_CONFIG,
      payload: {
        filtersConfig: [
          {
            key: 'columnId',
            label: formData.name,
            values: options,
            datatype: dataType,
          },
        ],
      },
    });

    dispatch({
      type: filtersContextActions.SET_SELECTED_FILTERS,
      payload: {
        selectedFilters: {
          columnId: {
            ...selectedFilters?.columnId,
            values: selectedFilters?.columnId?.values?.filter((value: string) => options.includes(value)),
          },
        },
      },
    });

    setFormData({
      columnAndDatasetList: newColumnAndDatasetList,
    });

    updateDatasetIds(newColumnAndDatasetList.map((item) => item.datasetId));
  };

  const handleSelectColumns = (selectedOptions: ComboboxOption[]) => {
    const newColumns = selectedOptions.map((option) => option.value as string);

    updateFiltersAndFormData(newColumns);
  };

  const handleRemoveColumn = (value: string) => {
    const newColumns = config.columns.filter((column) => column !== value);

    updateFiltersAndFormData(newColumns);
  };

  const handleRemoveDataset = () => {
    const newFormData = formData.columnAndDatasetList.filter((item) => item.datasetId !== config.datasetId);
    const datasetIds = newFormData.map((item) => item.datasetId);

    const updatedOptions = newFormData.flatMap((item) => item?.options ?? []);

    setFormData({
      columnAndDatasetList: newFormData,
    });

    updateDatasetIds(datasetIds);

    dispatch({
      type: filtersContextActions.SET_FILTERS_CONFIG,
      payload: {
        filtersConfig: [
          {
            ...(filtersConfig?.[0] ?? {}),
            values: updatedOptions,
          },
        ],
      },
    });

    if (datasetIds.length) {
      dispatch({
        type: filtersContextActions.SET_SELECTED_FILTERS,
        payload: {
          selectedFilters: {
            columnId: {
              ...selectedFilters?.columnId,
              values: selectedFilters?.columnId?.values?.filter((value: string) => updatedOptions.includes(value)),
            },
          },
        },
      });
    } else {
      dispatch({
        type: filtersContextActions.RESET_ALL_FILTERS,
      });
    }
  };

  return {
    isOpen,
    setIsOpen,
    columnOptions,
    handleSelectColumns,
    handleRemoveColumn,
    handleRemoveDataset,
    datasetOptions,
    isLoadingDatasetFilterConfig,
  };
};

export default useColumnSelector;
