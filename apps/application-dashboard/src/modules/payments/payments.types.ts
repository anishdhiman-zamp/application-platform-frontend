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
  id?: string;
  account_name: string;
  name?: string;
  account_number: string;
  account_number_masked?: string;
  currency_code?: string;
  account_type?: string;
  nick_name?: string;
  bank_name?: string;
  bank_identifier?: string;
  balance?: number | null;
  account_balance?: number | null;
}

export type TemplateDetailsType = {
  id: string;
  name: string;
  details: {
    order: string;
    source_account: AccountDetailsType;
    beneficiary_account: AccountDetailsType;
  }[];
  created_by: string;
  creation_timestamp: string;
  type: MOVE_MONEY_TYPE;
};

export enum MOVE_MONEY_TYPE {
  SINGLE_TRANSFER = 'single-transfer',
  SELF_TRANSFER = 'self-transfer',
  BULK_TRANSFER = 'bulk-transfer',
}

export enum MOVE_MONEY_PAYMENT_TYPE {
  RECIPIENT = 'RECIPIENT',
  TEMPLATES = 'TEMPLATES',
}
