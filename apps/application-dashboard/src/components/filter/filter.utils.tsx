import { Fragment } from 'react';
import { DATE_FORMATS, PERIODICITY_OPTIONS } from '@zamp-platform/utils';
import { format } from 'date-fns';
import { RuleFilters } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { FILTER_TYPES, FilterConfigType, MultiSelectFilterValue } from 'components/filter/filter.types';
import {
  AMOUNT_RANGE_FILTER_OPTIONS,
  AMOUNT_RANGE_TYPE_SYMBOL_MAP,
  CONDITION_OPERATOR_TYPE,
  CONDITION_OPERATOR_TYPE_LABEL_MAP,
  DOCUMENT_SEARCH_FILTER_OPTIONS,
  MULTI_SELECT_FILTER_OPTIONS,
  SEARCH_FILTER_OPTIONS,
  TAGS_SELECT_FILTER_OPTIONS,
} from 'components/filter/filters.constants';

export const getFilterValueForKey = (
  key: string,
  filterConfig: FilterConfigType[],
  selectedFilters: MapAny,
): FilterConfigType | undefined => {
  const config = filterConfig?.find((filter) => filter?.key === key);

  if (!config) return undefined;

  switch (config?.type) {
    case FILTER_TYPES.AMOUNT_RANGE: {
      const amountRangeFilter = selectedFilters?.[key];
      const isInBetween = amountRangeFilter?.type === CONDITION_OPERATOR_TYPE.IN_BETWEEN;
      const isNull = amountRangeFilter?.type === CONDITION_OPERATOR_TYPE.IS_NULL;
      const rangeValue = isInBetween
        ? `${amountRangeFilter?.filter} & ${amountRangeFilter?.filterTo}`
        : amountRangeFilter?.filter;

      const title = isNull
        ? AMOUNT_RANGE_FILTER_OPTIONS.find((option) => option.value === CONDITION_OPERATOR_TYPE.IS_NULL)?.label
        : `${
            AMOUNT_RANGE_TYPE_SYMBOL_MAP[amountRangeFilter?.type as keyof typeof AMOUNT_RANGE_TYPE_SYMBOL_MAP] ?? ''
          } ${rangeValue ?? ''} ${amountRangeFilter?.label ?? ''}`;

      return {
        ...config,
        title,
      };
    }

    case FILTER_TYPES.SINGLE_SELECT:
    case FILTER_TYPES.MULTI_SELECT: {
      const options: MultiSelectFilterValue[] = config.values?.filter(Boolean);
      const isObjectOptions = options?.some((option) => typeof option === 'object');
      const selectedFilter = selectedFilters[key];
      const isNull = selectedFilter?.type === CONDITION_OPERATOR_TYPE.IS_NULL;
      const operatorLabel =
        MULTI_SELECT_FILTER_OPTIONS.find((option) => option?.value === selectedFilter?.type)?.label ?? '';

      let title = '';
      const count = Array.isArray(selectedFilter?.values) ? selectedFilter?.values?.length : 0;

      title = isNull
        ? MULTI_SELECT_FILTER_OPTIONS.find((option) => option?.value === CONDITION_OPERATOR_TYPE.IS_NULL)?.label
        : Array.isArray(selectedFilter?.values)
          ? selectedFilter?.values?.join(', ')
          : (selectedFilter?.values ?? '');

      if (count) {
        const displayLabel = isObjectOptions
          ? ((options as { label: string; value: string }[]).find(
              (option) => option.value === selectedFilter?.values[0],
            )?.label ?? '')
          : selectedFilter?.values[0];

        title = `${operatorLabel} ${displayLabel} ${count > 1 ? `+${count - 1}` : ''}`;
      }

      return {
        ...config,
        title,
      };
    }
    //TODO: to be removed and enabled with type base

    case FILTER_TYPES.ARRAY_SEARCH: {
      const filter = selectedFilters[key];
      const operatorLabel = SEARCH_FILTER_OPTIONS.find((option) => option.value === filter?.type)?.label ?? '';

      const count = filter?.descriptionTags?.length;
      let title = filter?.filter ? `${operatorLabel} ${filter?.filter}` : '';

      if (count > 1) {
        title = `${filter?.descriptionTags[0]?.label} ${`+${count - 1}`}`;
      } else {
        title = filter?.value;
      }

      if (!filter) {
        title = '';
      }

      return {
        ...config,
        title,
      };
    }

    case FILTER_TYPES.DATE_RANGE: {
      try {
        const current = selectedFilters[key];
        let title = '';

        if (current?.dateTo && current?.dateFrom) {
          const startDate = format(new Date(current?.dateFrom), DATE_FORMATS.ddMMMyyyy);
          const endDate = format(new Date(current?.dateTo), DATE_FORMATS.ddMMMyyyy);
          const periodicity = PERIODICITY_OPTIONS.find((p) => p.value === current?.periodicity)?.label ?? '';

          title = `${startDate} - ${endDate}${periodicity ? `, ${periodicity} ` : ''}`;
        }

        return {
          ...config,
          title,
        };
      } catch (e) {
        console.log(e);
        break;
      }
    }

    case FILTER_TYPES.SEARCH: {
      const filter = selectedFilters[key];
      const operatorLabel = SEARCH_FILTER_OPTIONS.find((option) => option.value === filter?.type)?.label ?? '';
      let title = filter?.filter ? `${operatorLabel} ${filter?.filter}` : '';

      if (!filter) {
        title = '';
      }

      return {
        ...config,
        title,
      };
    }

    case FILTER_TYPES.TAGS: {
      const selectedFilter = selectedFilters[key];
      const isNull = selectedFilter?.type === CONDITION_OPERATOR_TYPE.IS_NULL;
      const operatorLabel =
        TAGS_SELECT_FILTER_OPTIONS.find((option) => option.value === selectedFilter?.type)?.label ?? '';

      let title = '';
      const count = Array.isArray(selectedFilter?.values) ? selectedFilter?.values?.length : 0;

      title = isNull
        ? TAGS_SELECT_FILTER_OPTIONS.find((option) => option.value === CONDITION_OPERATOR_TYPE.IS_NULL)?.label
        : Array.isArray(selectedFilter?.values)
          ? selectedFilter?.values?.map((v: string) => v.split('.')?.pop())?.join(', ')
          : (selectedFilter?.values?.split('.')?.pop() ?? '');

      if (count) {
        title = `${operatorLabel} ${selectedFilter?.values[0]?.split('.')?.pop()} ${count > 1 ? `+${count - 1}` : ''}`;
      }

      return {
        ...config,
        title,
      };
    }

    case FILTER_TYPES.DOCUMENT: {
      const filter = selectedFilters[key];
      const operatorLabel = DOCUMENT_SEARCH_FILTER_OPTIONS.find((option) => option.value === filter?.type)?.label ?? '';
      let title = filter?.filter ? `${operatorLabel} ${filter?.filter}` : '';

      if (!filter) {
        title = '';
      }

      return {
        ...config,
        title,
      };
    }

    default: {
      if (!Array.isArray(selectedFilters[key])) {
        const total = selectedFilters[key]?.length;

        let title = selectedFilters[key];

        if (!total) {
          title = '';
        }

        return {
          ...config,
          title,
        };
      }

      const values = selectedFilters[key];

      let title = values?.map((v: MapAny) => v?.label)?.join(', ');

      if (!values?.length) {
        title = '';
      }

      return {
        ...config,
        title,
      };
    }
  }

  return config;
};

export const getTagLabel = (tag?: string) => {
  const tagParts = tag?.split('.');

  const label = tagParts?.[tagParts?.length - 1] || tagParts?.[tagParts?.length - 2] || '';

  return label;
};

export const getTagParents = (tag: string) => {
  const parents = tag?.split('.').slice(0, -1) ?? [];

  return parents?.length ? parents?.join(' / ') : null;
};

const fieldValueClassName = 'border-BORDER_GRAY_400 border bg-white rounded-md pl-1.5 pr-2 py-1 text-nowrap h-fit';
const fieldOperatorClassName = 'text-GRAY_1000 pl-1.5 pr-2 py-1 text-nowrap h-fit';

export const getFilterStatementValues = (filter: RuleFilters | null): React.JSX.Element[] => {
  const Statement: React.JSX.Element[] = [];

  if (!filter) return Statement;
  filter?.conditions?.forEach((condition) => {
    const { column, operator, value } = condition;
    const columnName = column?.column;

    Statement.push(
      <>
        <span className={fieldValueClassName}>{columnName}</span>
        <span className={fieldOperatorClassName}>
          {CONDITION_OPERATOR_TYPE_LABEL_MAP[operator as keyof typeof CONDITION_OPERATOR_TYPE_LABEL_MAP]}
        </span>
        {Array.isArray(value) ? (
          value?.map((item: string, index: number) => (
            <Fragment key={index}>
              <span className={fieldValueClassName}>{item}</span>
              {index !== value?.length - 1 && <span className={fieldOperatorClassName}>or</span>}
            </Fragment>
          ))
        ) : (
          <span className={fieldValueClassName}>{value}</span>
        )}
      </>,
    );
  });

  return Statement;
};

export const isObjectValue = (value: MultiSelectFilterValue): value is { label: string; value: string } => {
  return typeof value === 'object' && value !== null && 'label' in value && 'value' in value;
};

export const getValueString = (value: MultiSelectFilterValue): string => {
  return isObjectValue(value) ? value.value : value?.toString();
};

export const getDisplayString = (value: MultiSelectFilterValue): string => {
  return isObjectValue(value) ? value?.label : value?.toString();
};
