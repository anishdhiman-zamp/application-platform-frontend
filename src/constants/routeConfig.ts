import { NavigationItemSchema } from 'types/config';

export const ROUTES_PATH = {
  HOME: '/',
  LOGIN: '/login',
  DATA: '/datasets',
  TEAM: '/team',
  DATASET_DRILLDOWN: '/datasets/drilldown/:datasetId/:rowId',
  DATASET: '/datasets/:datasetId',
  PAGES: '/pages/',
  PAGE_DATASET: '/pages/:pageId/datasets/:datasetId',
  PAGE_DATASET_DRILLDOWN: '/pages/:pageId/drilldown/:datasetId/:rowId',
  NO_ACCESS: '/no-access',
  ADMIN: '/admin',
  PAYMENTS: '/payments',
  MONEY_TRANSFER: '/payments/single-transfer',
};

export const getPageRouteById = (pageId: string) => {
  return `${ROUTES_PATH.PAGES}${pageId}`;
};

export const getDatasetRouteById = (datasetId: string) => {
  return `${ROUTES_PATH.DATA}/${datasetId}`;
};

export const getPageDatasetRoute = (pageId: string, datasetId: string) => {
  return `${ROUTES_PATH.PAGE_DATASET.replace(':pageId', pageId).replace(':datasetId', datasetId)}`;
};

export const getPageDatasetDrilldownRoute = (pageId: string, datasetId: string, rowId: string) => {
  return `${ROUTES_PATH.PAGE_DATASET_DRILLDOWN.replace(':pageId', pageId).replace(':datasetId', datasetId).replace(':rowId', rowId)}`;
};

export const getDatasetDrilldownRoute = (datasetId: string, rowId: string) => {
  return `${ROUTES_PATH.DATASET_DRILLDOWN.replace(':datasetId', datasetId).replace(':rowId', rowId)}`;
};

export const LOGIN_URLS = [ROUTES_PATH.LOGIN];

export const SIDEBAR_ITEMS: NavigationItemSchema[] = [
  {
    label: 'Data',
    iconId: 'coins-stacked-04',
    path: ROUTES_PATH.DATA,
  },
  {
    label: 'Payments',
    iconId: 'send-01',
    path: ROUTES_PATH.PAYMENTS,
    isHidden: true,
  },
  {
    label: 'Team',
    iconId: 'users-02',
    path: ROUTES_PATH.TEAM,
  },
];
