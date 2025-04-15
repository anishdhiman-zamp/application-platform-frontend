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
  account_number_last_four_characters?: string;
  banking_partner?: string;
  account_holder_name?: string;
}

export enum MOVE_MONEY_TYPE {
  SINGLE_TRANSFER = 'single',
  SELF_TRANSFER = 'self',
  BULK_TRANSFER = 'bulk',
}

export enum MOVE_MONEY_PAYMENT_TYPE {
  RECIPIENT = 'RECIPIENT',
  TEMPLATES = 'TEMPLATES',
  ACCOUNTS = 'ACCOUNTS',
}
