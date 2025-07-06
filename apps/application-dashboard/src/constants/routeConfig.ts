import { NavigationItemSchema } from 'types/config';

export const ROUTES_PATH = {
  HOME: '/',
  LOGIN: '/login',
  DATA: '/datasets',
  DATASET_DRILLDOWN: '/datasets/drilldown/:datasetId/:rowId',
  DATASET: '/datasets/:datasetId',
  PAGES: '/pages',
  PROCESSES: '/processes',
  PAGE_DATASET: '/pages/:pageId/datasets/:datasetId',
  PAGE_DATASET_DRILLDOWN: '/pages/:pageId/drilldown/:datasetId/:rowId',
  NO_ACCESS: '/no-access',
  ADMIN: '/admin',
  PAYMENTS: '/payments',
  INVITATIONS: '/invitations',
  MONEY_TRANSFER: '/payments/money-transfer',
  ADMIN_DATASETS: '/admin/datasets',
  ADMIN_DATASET: '/admin/datasets/:datasetId',
  ADMIN_ASSETS: '/admin/assets',
  PAGE_DRILLDOWN_MULTI: '/pages/:pageId/multi/:datasetIds',
  ADMIN_DATASETS_DAG: '/admin/datasets/dag',
  PROCESS: '/processes/:processId',
  PROCESS_ACTIVITY_LOGS: '/processes/:processId/activity-logs/:activityId',
  POLICIES: '/settings#dual-admin',
  TEAM: '/team',
  SETTINGS: '/settings',
};

export const getPageRouteById = (pageId: string) => {
  return `${ROUTES_PATH.PAGES}/${pageId}`;
};

export const getDatasetRouteById = (datasetId: string) => {
  return `${ROUTES_PATH.DATA}/${datasetId}`;
};

export const getPageDatasetRoute = (pageId: string, datasetId: string, query?: Record<string, string>) => {
  return `${ROUTES_PATH.PAGE_DATASET.replace(':pageId', pageId).replace(':datasetId', datasetId)}${
    query
      ? `?${Object.entries(query)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')}`
      : ''
  }`;
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

export const getProcessRouteById = (processId: string, status?: string) => {
  return `${ROUTES_PATH.PROCESS.replace(':processId', processId)}${status ? `?status=${status}` : ''}`;
};

export const getProcessActivityLogsRouteById = (processId: string, activityId: string, status?: string) => {
  return `${ROUTES_PATH.PROCESS_ACTIVITY_LOGS.replace(':processId', processId).replace(':activityId', activityId)}${status ? `?status=${status}` : ''}`;
};

export const LOGIN_URLS = [ROUTES_PATH.LOGIN];

export const SETTING_SIDEBAR_ITEMS = [
  {
    label: 'People',
    id: 'people',
    iconId: 'users-02',
    path: ROUTES_PATH.TEAM,
  },
  {
    label: 'Policies',
    id: 'policies',
    iconId: 'shield-zap',
    path: ROUTES_PATH.POLICIES,
  },
];
export const SIDEBAR_ITEMS: NavigationItemSchema[] = [
  {
    label: 'Data',
    id: 'data',
    iconId: 'coins-stacked-04',
    path: ROUTES_PATH.DATA,
  },
  {
    label: 'People',
    id: 'people',
    iconId: 'users-02',
    path: ROUTES_PATH.TEAM,
  },
];
