export enum CONNECT_ACCOUNT_STEPS {
  GET_STARTED,
  SELECT_DATASET,
  COLUMN_MAPPING,
}

export type ContactType = {
  contact_id: string;
  name: string;
};

export interface AccountDetailsType {
  account_id: string;
  account_name: string;
  account_number: string;
  currency_code: string;
  account_type: string;
  nick_name: string;
  bank_name: string;
  bank_identifier: string;
  balance?: string;
  account_balance: string;
}

export enum MOVE_MONEY_TYPE {
  SINGLE = 'single',
  SELF = 'self',
  BULK = 'bulk',
}

export enum MOVE_MONEY_PAYMENT_TYPE {
  RECIPIENT = 'RECIPIENT',
  TEMPLATES = 'TEMPLATES',
}
