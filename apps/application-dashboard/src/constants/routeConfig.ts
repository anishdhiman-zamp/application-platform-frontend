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
  INVITATIONS: '/invitations',
  MONEY_TRANSFER: '/payments/money-transfer',
  ADMIN_DATASETS: '/admin/datasets',
  ADMIN_DATASET: '/admin/datasets/:datasetId',
  PAGE_DRILLDOWN_MULTI: '/pages/:pageId/multi/:datasetIds',
  ADMIN_DATASETS_DAG: '/admin/datasets/dag',
  ACTIVITY: '/activity/:processId',
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

export const getPageDrilldownMultiRoute = (pageId: string, datasetIds: string[]) => {
  return `${ROUTES_PATH.PAGE_DRILLDOWN_MULTI.replace(':pageId', pageId).replace(':datasetIds', datasetIds?.join(','))}`;
};

export const getPageDatasetDrilldownRoute = (pageId: string, datasetId: string, rowId: string) => {
  return `${ROUTES_PATH.PAGE_DATASET_DRILLDOWN.replace(':pageId', pageId).replace(':datasetId', datasetId).replace(':rowId', rowId)}`;
};

export const getDatasetDrilldownRoute = (datasetId: string, rowId: string) => {
  return `${ROUTES_PATH.DATASET_DRILLDOWN.replace(':datasetId', datasetId).replace(':rowId', rowId)}`;
};

export const getAdminDatasetRouteById = (datasetId: string) => {
  return `${ROUTES_PATH.ADMIN_DATASETS}/${datasetId}`;
};

export const getActivityRouteByProcessId = (processId: string) => {
  return `${ROUTES_PATH.ACTIVITY.replace(':processId', processId)}`;
};

export const LOGIN_URLS = [ROUTES_PATH.LOGIN];

export const SIDEBAR_ITEMS: NavigationItemSchema[] = [
  {
    label: 'Data',
    id: 'data',
    iconId: 'coins-stacked-04',
    path: ROUTES_PATH.DATA,
  },
  {
    label: 'Payments',
    id: 'payments',
    iconId: 'send-01',
    path: ROUTES_PATH.PAYMENTS,
  },
  {
    label: 'Team',
    id: 'team',
    iconId: 'users-02',
    path: ROUTES_PATH.TEAM,
  },
];
