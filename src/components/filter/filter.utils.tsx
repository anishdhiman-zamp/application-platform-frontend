import { DATE_FORMATS } from 'constants/date.constants';
import { format } from 'date-fns';
import { MapAny } from 'types/commonTypes';
import { FILTER_TYPES, FilterConfigType } from 'components/filter/filter.types';
import {
  AMOUNT_RANGE_TYPE_SYMBOL_MAP,
  CONDITION_OPERATOR_TYPE,
  FILTER_KEYS,
} from 'components/filter/filters.constants';

export const getFilterValueForKey = (key: FILTER_KEYS, filterConfig: FilterConfigType[], selectedFilters: MapAny) => {
  const config = filterConfig.find((filter) => filter.key === key);

  switch (config?.type) {
    case FILTER_TYPES.AMOUNT_RANGE: {
      const amountRangeFilter = selectedFilters?.[key];
      const isInBetween = amountRangeFilter?.type === CONDITION_OPERATOR_TYPE.IN_BETWEEN;
      const rangeValue = isInBetween
        ? `${amountRangeFilter?.filter} & ${amountRangeFilter?.filterTo}`
        : amountRangeFilter?.filter;

      const title = `${
        AMOUNT_RANGE_TYPE_SYMBOL_MAP[amountRangeFilter?.type as keyof typeof AMOUNT_RANGE_TYPE_SYMBOL_MAP] ?? ''
      } ${rangeValue ?? ''} ${amountRangeFilter?.label ?? ''}`;

      return {
        ...config,
        title,
      };
    }

    case FILTER_TYPES.MULTI_SELECT: {
      const selectedFilter = selectedFilters[key];
      let title = '';

      title = selectedFilter?.values?.join(', ');

      if (!selectedFilter?.values?.length) {
        title = '';
      }

      return {
        ...config,
        title,
      };
    }
    //TODO: to be removed and enabled with type base

    case FILTER_TYPES.DATE_RANGE: {
      try {
        const current = selectedFilters[key];
        let title = '';

        if (current?.dateTo && current?.dateFrom) {
          const startDate = format(new Date(current?.dateFrom), DATE_FORMATS.dd_MMM_yyyy);
          const endDate = format(new Date(current?.dateTo), DATE_FORMATS.dd_MMM_yyyy);

          title = `${startDate} - ${endDate}`;
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
      let title = filter?.filter;

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

      let title = values?.map((v: MapAny) => v?.label).join(', ');

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

export const getTagLabel = (tag: string) => {
  return tag?.split('.').pop() ?? '';
};

export const getTagParents = (tag: string) => {
  const parents = tag?.split('.').slice(0, -1) ?? [];

  return parents.length ? parents.join(' / ') : null;
};

const fieldValueClassName = 'border-BORDER_GRAY_400 border bg-white rounded-md pl-1.5 pr-2 py-1';
const fieldOperatorClassName = 'text-GRAY_1000 pl-1.5 pr-2 py-1';

export const getFilterStatementValues = (filter: MapAny): JSX.Element[] => {
  const Statement: JSX.Element[] = [];

  Object.keys(filter).forEach((key) => {
    switch (filter[key].filterType) {
      case FILTER_TYPES.SEARCH:
        Statement.push(
          <>
            <span className={fieldValueClassName}>{key}</span>
            <span className={fieldOperatorClassName}>{filter[key].type}</span>
            <span className={fieldValueClassName}>{filter[key].filter}</span>
          </>,
        );
        break;
      case FILTER_TYPES.DATE_RANGE:
        Statement.push(
          <>
            <span className={fieldValueClassName}>{key}</span>
            <span className={fieldOperatorClassName}>{filter[key].type}</span>
            {filter[key].dateFrom && (
              <span className={fieldValueClassName}>{new Date(filter[key].dateFrom)?.toLocaleDateString()}</span>
            )}
            {filter[key].dateFrom && filter[key].dateTo && <span className={fieldOperatorClassName}>-</span>}
            {filter[key].dateTo && (
              <span className={fieldValueClassName}>{new Date(filter[key].dateTo)?.toLocaleDateString()}</span>
            )}
          </>,
        );
        break;
      case FILTER_TYPES.MULTI_SELECT:
        Statement.push(
          <>
            <span className={fieldValueClassName}>{key}</span>
            <span className={fieldOperatorClassName}>{filter[key].type}</span>
            <span className={fieldValueClassName}>{filter[key].values.join(', ')}</span>
          </>,
        );
        break;
      case FILTER_TYPES.AMOUNT_RANGE:
        Statement.push(
          <>
            <span className={fieldValueClassName}>{key}</span>
            <span className={fieldOperatorClassName}>{filter[key].type}</span>
            <span className={fieldValueClassName}>{filter[key].filter}</span>
            {filter[key].filterTo && (
              <>
                <span className={fieldOperatorClassName}>-</span>
                <span className={fieldValueClassName}>{filter[key].filterTo}</span>
              </>
            )}
          </>,
        );
        break;
    }
  });

  return Statement;
};
