import { ICON_SPRITE_TYPES } from 'constants/icons';
import { NavigationItemSchema } from "types/config";

export const ROUTES_PATH = {
    HOME: '/cash-summary',
    LOGIN: '/login',
    DATA: '/',
    PAYMENTS: '/payments',
    SETTINGS: '/settings',
    DRILLDOWN: '/drilldown/:datasetId/:rowId',
    DATASET: '/dataset/:datasetId',
    PAGE: '/page',
}

export const LOGIN_URLS = [ROUTES_PATH.LOGIN];

export const SIDEBAR_ITEMS: NavigationItemSchema[] = [
    {
        label: 'Data',
        iconId: 'coins-stacked-04',
        iconCategory: ICON_SPRITE_TYPES.FINANCE_AND_ECOMMERCE,
        path: ROUTES_PATH.DATA,
    },
    {
        label: 'Payments',
        iconId: 'send-01',
        iconCategory: ICON_SPRITE_TYPES.COMMUNICATION,
        path: ROUTES_PATH.PAYMENTS,
    },
    {
        label: 'Settings',
        iconId: 'settings-01',
        iconCategory: ICON_SPRITE_TYPES.GENERAL,
        path: ROUTES_PATH.SETTINGS,
    },
];

