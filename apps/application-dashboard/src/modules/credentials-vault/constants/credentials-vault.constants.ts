// Copy
export const DELETE_CREDENTIAL_DESCRIPTION = 'Agents that rely on this key will not be able to continue their work';

// Display
export const MASK_CHAR = '•';
export const MASK_LENGTH = 16;
export const MASKED_VALUE = MASK_CHAR.repeat(MASK_LENGTH);

export const CREDENTIAL_PURPOSE = {
  AUTHENTICATION: 'authentication',
  USER_PERSONAL_CREDS: 'user_personal_creds',
  AGENT_MANAGED_DB_ROLE_PASSWORD: 'agent_managed_db_role_password',
} as const;

export const DEFAULT_VAULT_CREDENTIAL_PURPOSE = CREDENTIAL_PURPOSE.USER_PERSONAL_CREDS;
export const DEFAULT_CREDENTIAL_TYPE = 'custom';

// Pagination
export const DEFAULT_VAULT_PAGE = 1;
export const DEFAULT_VAULT_LIMIT = 100;

// User feedback
export const CREDENTIAL_TOAST_MESSAGE = {
  ADD_SUCCESS: 'Credential added',
  ADD_FAILURE: 'Failed to add credential',
  UPDATE_SUCCESS: 'Credential updated',
  UPDATE_FAILURE: 'Failed to update credential',
  DELETE_SUCCESS: 'Credential deleted',
  DELETE_FAILURE: 'Failed to delete credential',
  COPY_SUCCESS: 'Copied to clipboard',
  COPY_FAILURE: 'Failed to copy',
} as const;

export const CREDENTIAL_VALIDATION_ERROR = {
  NAME_REQUIRED: 'Credential name is required',
  KEY_NAME_REQUIRED: 'Key name is required',
  KEY_VALUE_REQUIRED: 'Key value is required',
} as const;

// Dialog
export const CREDENTIAL_KEY_FIELD = {
  KEY_NAME: 'keyName',
  KEY_VALUE: 'keyValue',
} as const;

export const CREDENTIAL_COLUMN_LABELS = {
  KEY_NAME: 'Key name',
  KEY_VALUE: 'Key value',
} as const;

export const CREDENTIAL_DIALOG_MODE = {
  ADD: 'add',
  MANAGE: 'manage',
} as const;

export const CREDENTIAL_DIALOG_CONFIG = {
  [CREDENTIAL_DIALOG_MODE.ADD]: { title: 'Add credentials', primaryCta: 'Done' },
  [CREDENTIAL_DIALOG_MODE.MANAGE]: { title: 'Manage credentials', primaryCta: 'Save' },
} as const;
