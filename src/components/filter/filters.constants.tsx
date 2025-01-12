import { FILTER_TYPES } from 'components/filter/filter.types';

export enum FILTER_PERIODICITIES {
    YEARLY = 'yearly',
    QUARTERLY = 'quarterly',
    MONTHLY = 'monthly',
    WEEKLY = 'weekly',
    DAILY = 'daily',
}

export enum FILTER_KEYS {
    DATE_RANGE = 'date_range',
}

export const AG_GRID_FILTER_TYPES = {
    [FILTER_TYPES.SEARCH]: 'agTextColumnFilter',
    [FILTER_TYPES.DATE_RANGE]: 'agDateColumnFilter',
    [FILTER_TYPES.AMOUNT_RANGE]: 'agNumberColumnFilter',
    [FILTER_TYPES.MULTI_SELECT]: 'agMultiSelectColumnFilter',
}