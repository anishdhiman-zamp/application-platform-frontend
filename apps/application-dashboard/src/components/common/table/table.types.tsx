export enum CUSTOM_COLUMNS_TYPE {
  TAG = 'tags',
  CHIP = 'chips',
  STATUS_BADGE = 'status-tag',
  USER_AVATAR = 'user-avatar',
  ACTIVITY_DOCUMENT = 'activity_document',
  ACTIVITY_CURRENT_STATUS = 'activity_current_status',
  ACTIVITY_STATUS = 'activity_status',
  BANK_NAME = 'bank-name',
  PAYMENTS_ACCOUNT_STATUS = 'payments-account-status',
}

export const enum DISPLAY_OPTIONS {
  COLUMNS = 'columns',
  GROUP_BY = 'group_by',
  CURRENCY = 'currency',
}

export enum VALUE_FORMAT_TYPE {
  ROUND_OFF = 'round_off',
  DATE_TIME = 'date_time',
  PREFIX = 'prefix',
  COLUMN_PREFIX = 'column_prefix',
}

export type ColumnVisibility = {
  colId: string;
  isVisible: boolean;
};
