import { AccountDetailsType, MOVE_MONEY_TYPE } from '@/modules/payments/payments.types';
import { MenuItem } from '@/types/common/components';

export type SourceAccountResponseType = {
  accounts: AccountDetailsType[];
};

export type TemplateDetailsType = {
  id: string;
  name: string;
  details: {
    order: string;
    source_account: AccountDetailsType;
    destination_account: AccountDetailsType;
  }[];
  created_by: string;
  creation_timestamp: string;
  type: MOVE_MONEY_TYPE;
};

export type TemplateListResponseType = {
  templates: TemplateDetailsType[];
};

export type RecipientAccountDetailsType = {
  masked_account_number: string;
  account_details: MenuItem[];
};

export type RecipientDetailsType = {
  id: string;
  name: string;
  email: string;
  accounts: AccountDetailsType[];
  recipient_details: MenuItem[];
  account_name: string;
  masked_account_number: string;
  currency_code: string;
  bank_name: string;
  account_number: string;
};

export type RecipientListResponseType = {
  id: string;
  name: string;
  email: string;
  accounts: RecipientAccountDetailsType[];
  recipient: {
    email: string;
    name: string;
    id: string;
    recipient_details: MenuItem[];
  };
};

export type DestinationAccountPayloadType = {
  source_account_id: string;
};

export type CreateTemplatePayloadType = {
  template_name: string;
  details: {
    order: string;
    source_account_id: string;
    destination_account_id: string;
  }[];
  description: string;
  type: string;
};

export type RecipientBySourceAccountPayloadType = {
  source_account_id: string;
};

export type RecipientBySourceAccountResponseType = {
  recipients: RecipientDetailsType[];
};

export type InitiatePaymentPayloadType = {
  type: MOVE_MONEY_TYPE;
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  payments_processing_mode: string;
  statement_descriptor: string;
  notes?: string[];
};
