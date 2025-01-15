import { format } from 'date-fns';
import { MapAny } from 'types/commonTypes';
import { FILTER_TYPES, FilterConfigType } from 'components/filter/filter.types';
import { AMOUNT_RANGE_TYPE_SYMBOL_MAP, FILTER_KEYS, RANGE_FILTER_VALUES } from 'components/filter/filters.constants';

export const getFilterValueForKey = (
    key: FILTER_KEYS,
    filterConfig: FilterConfigType[],
    selectedFilters: MapAny
) => {
    const config = filterConfig.find((filter) => filter.key === key);

    switch (config?.type) {

        case FILTER_TYPES.AMOUNT_RANGE: {
            const amountRangeFilters = selectedFilters?.[key];

            const amountRangeFilter = amountRangeFilters?.[0];

            const isInBetween = amountRangeFilter?.type === RANGE_FILTER_VALUES.IN_BETWEEN;
            const rangeValue = isInBetween
                ? `${amountRangeFilter?.is_greater_than} & ${amountRangeFilter?.is_less_than}`
                : amountRangeFilter?.[amountRangeFilter?.type];

            const title = `${AMOUNT_RANGE_TYPE_SYMBOL_MAP[amountRangeFilter?.type as keyof typeof AMOUNT_RANGE_TYPE_SYMBOL_MAP] ?? ''
                } ${rangeValue ?? ''} ${amountRangeFilter?.label ?? ''}`;

            return {
                ...config,
                title,
            };
        }

        case FILTER_TYPES.MULTI_SELECT: {
            const values = selectedFilters[key];
            let title = '';

            if (config?.type === FILTER_TYPES.MULTI_SELECT) {
                const total = selectedFilters[key]?.length;

                title = `${total} ${config?.label} `;
            } else {
                title = values?.map((v: MapAny) => v?.label).join(', ');
            }

            if (!values?.length) {
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

                if (current?.start_date && current?.end_date) {
                    const startDate = format(current?.start_date, 'yyyy-MMM-dd');
                    const endDate = format(current?.end_date, 'yyyy-MMM-dd');

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