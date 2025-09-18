import {
  DATA_TYPE_TO_FILTER_TYPE,
  NUMBER_COLUMN_TYPES,
  STRING_COLUMN_TYPES,
  TIMESTAMP_COLUMN_TYPES,
} from 'modules/sheets/CreateEditFilter/constants';
import {
  DataType,
  FormatEditFilterDataToFormDataOutputType,
  FormatFormDataForCreateOutputType,
  FormatFormDataForCreateParamsType,
  FormDataType,
  IsDatatypeMatchParams,
} from 'modules/sheets/CreateEditFilter/types';
import { getFilterDefaultValue } from 'modules/sheets/sheets.utils';
import { CUSTOM_COLUMNS_TYPE } from '@/components/common/table/table.types';
import { getConditionValues } from '@/components/common/table/table.utils';
import { FILTER_TYPES, FilterConfigType } from '@/components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE, OPERATOR } from '@/components/filter/filters.constants';
import { DEFAULT_FILTER_OPERATORS } from '@/modules/widgets/create/constants';
import { WidgetDataValueType } from '@/modules/widgets/widgets.constant';
import { SheetFilterType, TargetType } from '@/types/api/pagesApi.types';
import { MapAny } from '@/types/commonTypes';

export const formatFormDataForCreate: (
  params: FormatFormDataForCreateParamsType,
) => FormatFormDataForCreateOutputType = ({
  formData,
  datasetIdAndWidgetsMapping,
  selectedFilters,
  filtersConfig,
  isSearchFilter,
}) => {
  const widgetsInScope: string[] = [];
  const targets: TargetType[] = [];

  for (const config of formData.columnAndDatasetList) {
    widgetsInScope.push(...(datasetIdAndWidgetsMapping[config.datasetId] || []));
    targets.push(
      ...config.columns.map((column) => ({
        column: column,
        dataset_id: config.datasetId,
      })),
    );
  }

  const filterDefaultValues = getConditionValues(selectedFilters?.['columnId']);
  const filterValue = Array.isArray(filterDefaultValues?.value)
    ? filterDefaultValues?.value
    : [filterDefaultValues?.value];
  const updatedFilterValue: string[] = [];

  for (const value of filterValue) {
    if (!value) continue;
    if (typeof value !== 'string') {
      updatedFilterValue.push(`${value}`);
    } else {
      updatedFilterValue.push(value);
    }
  }

  const payload: SheetFilterType = {
    name: formData.name,
    data_type: (filtersConfig?.[0]?.datatype as WidgetDataValueType) ?? '',
    filter_type: isSearchFilter ? FILTER_TYPES.SEARCH : DATA_TYPE_TO_FILTER_TYPE[formData?.datatype],
    default_value: {
      value: updatedFilterValue,
      operator: filterDefaultValues?.operator as CONDITION_OPERATOR_TYPE,
    },
    widgets_in_scope: widgetsInScope,
    targets,
  };

  return { payload, filterId: formData.id ?? '' };
};

export const formatEditFilterDataToFormData: (filter: SheetFilterType) => FormatEditFilterDataToFormDataOutputType = (
  filter,
) => {
  const columnDataMapping: Record<string, string[]> = {};
  const selectedDatasetIds: string[] = [];

  for (const target of filter.targets) {
    if (!columnDataMapping[target.dataset_id]) {
      columnDataMapping[target.dataset_id] = [];
      selectedDatasetIds.push(target.dataset_id);
    }

    columnDataMapping[target.dataset_id].push(target.column);
  }

  const editFormData: FormDataType = {
    name: filter.name,
    columnAndDatasetList: Object.entries(columnDataMapping).map(([datasetId, columns]) => ({
      datasetId,
      columns,
      filterType: filter.filter_type,
      options: filter?.options ?? [],
    })),
    id: filter.id,
    datatype: getDatatype(filter),
  };

  const filtersConfig: FilterConfigType[] = [
    {
      key: 'columnId',
      label: filter.name,
      values: filter?.options ?? [],
      type: filter.filter_type,
      datatype: filter.data_type ?? '',
    },
  ];

  let selectedFilters: MapAny = {};

  if (filter?.default_value) {
    selectedFilters = {
      columnId: getFilterDefaultValue(filter?.default_value, filter.filter_type),
    };
  }

  return {
    editFormData,
    selectedDatasetIds,
    filtersConfig,
    selectedFilters,
  };
};

export const isDatatypeMatch = ({ datatype, datatypeToMatch, customType }: IsDatatypeMatchParams) => {
  switch (datatypeToMatch) {
    case DataType.TAGS:
      return customType === CUSTOM_COLUMNS_TYPE.TAG;
    case DataType.TIMESTAMP:
      return TIMESTAMP_COLUMN_TYPES.includes(datatype.toUpperCase() as WidgetDataValueType);
    case DataType.NUMBER:
      return NUMBER_COLUMN_TYPES.includes(datatype.toUpperCase() as WidgetDataValueType);
    case DataType.STRING:
      return (
        STRING_COLUMN_TYPES.includes(datatype.toUpperCase() as WidgetDataValueType) &&
        customType !== CUSTOM_COLUMNS_TYPE.TAG
      );
    default:
      return false;
  }
};

export const getDatatype = (filter: SheetFilterType) => {
  let datatype = DataType.STRING;
  const datatypeValues = Object.values(DataType);

  for (const value of datatypeValues) {
    if (
      isDatatypeMatch({
        datatype: filter.data_type ?? '',
        datatypeToMatch: value,
        customType: filter.filter_type,
      })
    ) {
      datatype = value;
      break;
    }
  }

  return datatype;
};

export const getDefaultOperatorLabel = (selectedFilters: MapAny, filterType: FILTER_TYPES) => {
  const operatorValues = Object.values(OPERATOR);

  if (selectedFilters?.['columnId']?.type) {
    return operatorValues.find((operator) => operator.value === selectedFilters['columnId']?.type)?.label;
  }

  return operatorValues.find((operator) => operator.value === DEFAULT_FILTER_OPERATORS[filterType])?.label;
};
