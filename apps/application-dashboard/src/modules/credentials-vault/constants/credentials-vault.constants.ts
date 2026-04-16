export const DELETE_CREDENTIAL_DESCRIPTION = 'Agents that rely on this key will not be able to continue their work';

export const MASK_CHAR = '•';
export const MASK_LENGTH = 16;

export const CREDENTIAL_KEY_FIELD = {
  KEY_NAME: 'keyName',
  KEY_VALUE: 'keyValue',
} as const;

export const CREDENTIAL_DIALOG_MODE = {
  ADD: 'add',
  MANAGE: 'manage',
} as const;

export const CREDENTIAL_DIALOG_CONFIG = {
  [CREDENTIAL_DIALOG_MODE.ADD]: { title: 'Add credentials', primaryCta: 'Done' },
  [CREDENTIAL_DIALOG_MODE.MANAGE]: { title: 'Manage credentials', primaryCta: 'Save' },
} as const;
