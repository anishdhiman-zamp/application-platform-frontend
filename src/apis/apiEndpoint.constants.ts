export const API_ENDPOINTS = {
    AUTH_INITIATE_LOGIN_FLOW_GET: `auth/relay/self-service/login/browser`,
    AUTH_INITIATE_LOGOUT_FLOW_GET: `auth/relay/self-service/logout/browser`,
    USER_WHOAMI_GET: 'auth/whoami',
    AUTH_ERROR_DETAILS_GET: `auth/relay/internal/self-service/errors`,
    DATASET_FILTER_CONFIG_GET: `datasets/{{datasetId}}/filter-config`,
    DATASET_DATA_GET: `datasets/{{datasetId}}/data`,
    DATASET_DRILLDOWN_GET: `datasets/{{datasetId}}/drill-down/row/{{rowId}}`,
    DATASET_LISTING_GET: `datasets/listing`,
  };
  
  export const enum REQUEST_TYPES {
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
  }