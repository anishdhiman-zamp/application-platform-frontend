import type { SiblingTask, TaskBreadcrumb } from '@zamp-platform/chat';

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
  PAGE_SHEET: '/pages/:pageId/:sheetId',
  NO_ACCESS: '/no-access',
  PAYMENTS: '/payments',
  INVITATIONS: '/invitations',
  MONEY_TRANSFER: '/payments/money-transfer',
  ADMIN_DATASETS: '/admin/datasets',
  ADMIN_DATASET: '/admin/datasets/:datasetId',
  PAGE_DRILLDOWN_MULTI: '/pages/:pageId/multi-dataset',
  ADMIN_DATASETS_DAG: '/admin/datasets/dag',
  PROCESS_CREATE: '/processes/create',
  PROCESS_ID: '/processes/:processId',
  PROCESS_ACTIVITY_LOGS: '/processes/:processId/activity-logs/:activityId',
  POLICIES: '/settings#dual-admin',
  PEOPLE: '/people',
  KNOWLEDGE_BASE: '/processes/:processId/knowledge-base',
  CREATE_KNOWLEDGE_BASE: '/processes/:processId/create-knowledgebase',
  WIDGET_CREATE: '/widgets/create',
  INVALID_SCREEN_SIZE: '/invalid-screen-size',
  MEMBERSHIP_PENDING: '/membership-pending',
  SETUP_WORKSPACE: '/setup-workspace',

  SETTINGS: '/settings',
  INTEGRATIONS: '/settings/integrations',
  INTEGRATION_DETAIL: '/settings/integrations/:integrationId',
  SETTINGS_PEOPLE: '/settings/people',

  ONBOARDING: '/onboarding',

  MACS: '/macs',

  CHAT: '/chat',
  CHAT_SKILLS: '/chat/skills',
  CHAT_SETTINGS: '/chat/settings',
  CHAT_SETTINGS_PEOPLE: '/chat/settings/people',
  CHAT_TASKS: '/chat/task',
  CHAT_SETTINGS_INTEGRATIONS: '/chat/settings/integrations',
  CHAT_SETTINGS_GENERAL: '/chat/settings/general',
  CHAT_SETTINGS_DATASETS: '/chat/settings/datasets',
  CHAT_SETTINGS_DATASETS_NEW: '/chat/settings/datasets/new',
  CHAT_SETTINGS_DATASET_DETAIL: '/chat/settings/datasets/:tableName',
  CHAT_SETTINGS_ORG_SETTINGS: '/chat/settings/organisation-settings',
  CHAT_TASK: '/chat/task',
  CHAT_APPS: '/chat/apps',
  CHAT_AGENTS: '/chat/agents',
  CHAT_AGENT: '/chat/agents/:agentId',
};

export const getPageRouteById = (pageId: string, sheetId?: string) => {
  return `${ROUTES_PATH.PAGES}/${pageId}${sheetId ? `/${sheetId}` : ''}`;
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

export const getPageDrilldownMultiRoute = (pageId: string) => {
  return `${ROUTES_PATH.PAGE_DRILLDOWN_MULTI.replace(':pageId', pageId)}`;
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
  return `${ROUTES_PATH.PROCESS_ID.replace(':processId', processId)}${status ? `?status=${status}` : ''}`;
};

export const getProcessActivityLogsRouteById = (
  processId: string,
  activityId: string,
  status?: string,
  filterContext?: string,
  currentIndex?: number,
  totalRows?: number,
) => {
  const baseUrl = ROUTES_PATH.PROCESS_ACTIVITY_LOGS.replace(':processId', processId).replace(':activityId', activityId);
  const queryParams = [];

  if (status) queryParams.push(`status=${status}`);
  if (filterContext) queryParams.push(`filterContext=${filterContext}`);
  if (currentIndex !== undefined) queryParams.push(`currentIndex=${currentIndex}`);
  if (totalRows !== undefined) queryParams.push(`totalRows=${totalRows}`);

  return `${baseUrl}${queryParams.length > 0 ? `?${queryParams.join('&')}` : ''}`;
};

export const getKnowledgeBasedRouteByProcessId = (processId: string) => {
  return `${ROUTES_PATH.KNOWLEDGE_BASE.replace(':processId', processId)}`;
};

export const getCreateKnowledgeBaseRouteByProcessId = (processId: string) => {
  return `${ROUTES_PATH.CREATE_KNOWLEDGE_BASE.replace(':processId', processId)}`;
};

export const getIntegrationDetailRoute = (integrationId: string) => {
  return `${ROUTES_PATH.INTEGRATION_DETAIL.replace(':integrationId', integrationId)}`;
};

export const getChatFileRoute = (filePath: string) => {
  return `${ROUTES_PATH.CHAT}?f=${encodeURIComponent(filePath)}`;
};

export const TASK_QUERY_PARAMS = {
  PARENT_TASKS: 'parentTasks',
  SIBLINGS: 'siblings',
  REFERRER: 'referrer',
} as const;

export const getChatTaskRoute = ({
  taskId,
  conversationId,
  taskTitle,
  status,
  currentIndex,
  totalRows,
  parentTasks,
  siblings,
  referrer,
}: {
  taskId: string;
  conversationId?: string;
  taskTitle?: string;
  status?: string;
  currentIndex?: number;
  totalRows?: number;
  parentTasks?: TaskBreadcrumb[];
  siblings?: SiblingTask[];
  referrer?: string;
}) => {
  const basePath = ROUTES_PATH.CHAT_TASK;
  const params = new URLSearchParams();

  params.set('t', taskId);
  if (conversationId) params.set('s', conversationId);
  if (taskTitle) params.set('title', taskTitle);
  if (status) params.set('status', status);
  if (currentIndex !== undefined) params.set('currentIndex', String(currentIndex + 1));
  if (totalRows !== undefined) params.set('totalRows', String(totalRows));
  if (parentTasks && parentTasks.length > 0) params.set(TASK_QUERY_PARAMS.PARENT_TASKS, JSON.stringify(parentTasks));
  if (siblings && siblings.length > 0) params.set(TASK_QUERY_PARAMS.SIBLINGS, JSON.stringify(siblings));
  if (referrer) params.set(TASK_QUERY_PARAMS.REFERRER, referrer);

  return `${basePath}?${params.toString()}`;
};

export const getDatasetDetailRoute = (tableName: string) => {
  return `${ROUTES_PATH.CHAT_SETTINGS_DATASET_DETAIL.replace(':tableName', tableName)}`;
};

export const LOGIN_URLS = [ROUTES_PATH.LOGIN];
