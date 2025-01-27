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
  return tag.split('.').pop();
};

export const getTagParents = (tag: string) => {
  const parents = tag.split('.').slice(0, -1);

  return parents.length ? parents.join(' / ') : null;
};
