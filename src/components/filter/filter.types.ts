import { ReactNode } from "react";


export enum FILTER_TYPES {
    SEARCH = 'search',
    MULTI_SELECT = 'multi-select',
    DATE_RANGE = 'date-range',
    NUMBER_RANGE = 'number-range',
    AMOUNT_RANGE = 'amount-range',
    ACCOUNT_TYPES = 'account-types',
}

export interface FilterMenuType {
    id?: string;
    label?: string | ReactNode;
    value: string | number;
    type?: string;
    is_equal_to?: number;
    is_not_equal_to?: number;
    is_greater_than?: number;
    is_less_than?: number;
}

export interface FilterEntityMenuType extends FilterMenuType {
    id: string;
    display_name?: string;
    amount_range_currencies?: FilterMenuType[];
    account_types?: FilterMenuType[];
}