import { ICON_SPRITE_TYPES } from 'constants/icons';
import { NavigationItemSchema } from 'types/config';

export const ROUTES_PATH = {
  HOME: '/',
  LOGIN: '/login',
  DATA: '/datasets',
  PAYMENTS: '/payments',
  SETTINGS: '/settings',
  PEOPLE: '/people',
  DRILLDOWN: '/drilldown/:datasetId/:rowId',
  DATASET: '/datasets/:datasetId',
  PAGES: '/pages/',
};

export const getPageRouteById = (pageId: string) => {
  return `${ROUTES_PATH.PAGES}${pageId}`;
};

export const getDatasetRouteById = (datasetId: string) => {
  return `${ROUTES_PATH.DATA}/${datasetId}`;
};

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
  {
    label: 'People',
    iconId: 'users-02',
    iconCategory: ICON_SPRITE_TYPES.USERS,
    path: ROUTES_PATH.PEOPLE,
  },
];
