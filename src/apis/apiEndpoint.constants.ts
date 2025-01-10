export const API_ENDPOINTS = {
    AUTH_INITIATE_LOGIN_FLOW_GET: `auth/relay/self-service/login/browser`,
    AUTH_INITIATE_LOGOUT_FLOW_GET: `auth/relay/self-service/logout/browser`,
    USER_WHOAMI_GET: 'auth/whoami',
    AUTH_ERROR_DETAILS_GET: `auth/relay/internal/self-service/errors`,
}

export const enum REQUEST_TYPES {
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}
