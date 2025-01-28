export const API_ENDPOINTS = {
  INVITE_AUDIENCES_BY_ORGANIZATION_ID_POST: `organizations/{{organizationId}}/audiences/invitations`,
  INVITED_AUDIENCES_BY_ORGANIZATION_ID_GET: `organizations/{{organizationId}}/audiences/invitations`,
  AUDIENCES_BY_ORGANIZATION_ID_GET: `organizations/{{organizationId}}/audiences`,

  AUTH_INITIATE_LOGIN_FLOW_GET: `auth/relay/self-service/login/browser`,
  AUTH_INITIATE_LOGOUT_FLOW_GET: `auth/relay/self-service/logout/browser`,
  AUTH_INITIAL_LOGIN_FLOW_BY_EMAIL_POST: `auth/login/flow/create`,
  USER_WHOAMI_GET: 'auth/whoami',
  AUTH_ERROR_DETAILS_GET: `auth/relay/internal/self-service/errors`,

  DATASET_FILTER_CONFIG_GET: `datasets/{{datasetId}}/filter-config`,
  DATASET_DATA_GET: `datasets/{{datasetId}}/data`,
  DATASET_DRILLDOWN_GET: `datasets/{{datasetId}}/drill-down/row/{{rowId}}`,
  DATASET_LISTING_GET: `datasets/listing`,
  AUDIENCES_BY_DATASET_ID_GET: `datasets/{{datasetId}}/audiences`,
  SHARE_DATASET_TO_AUDIENCES_BY_DATASET_ID_POST: `datasets/{{datasetId}}/audiences`,
  DATASET_UPDATE_POST: `datasets/{{datasetId}}/update-data`,
  DATASET_ACTION_STATUS_GET: `datasets/{{datasetId}}/actions`,

  WIDGET_INSTANCE_GET: `widgets/{{widgetId}}/instance`,
  WIDGET_DATA_GET: `widgets/{{widgetId}}/data`,

  PAGES_GET: `pages/get-pages`,
  PAGES_SHEETS_GET: `pages/{{pageId}}`,
  PAGES_SHEETS_SHEET_GET: `pages/{{pageId}}/sheets/{{sheetId}}`,
  PAGES_SHEETS_FILTER_CONFIG_GET: `pages/{{pageId}}/sheets/{{sheetId}}/filters`,
};

export const enum REQUEST_TYPES {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
