import { MapAny } from '@/types/commonTypes';
import { NON_CONFIGURABLE_CURRENCY_FILTER_KEY } from 'components/filter/filterMenu/FiltersMenuV3/constants';

export const hasNoFiltersExceptCurrency = (filters: MapAny) => {
  const keys = Object.keys(filters);
  const keysLength = keys.length;

  if (keys.includes(NON_CONFIGURABLE_CURRENCY_FILTER_KEY)) {
    return keysLength - 1 === 0;
  }

  return keysLength === 0;
};
