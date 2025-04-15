import { AccountDetailsType, MOVE_MONEY_TYPE } from '@/modules/payments/payments.types';

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

export type RecipientListResponseType = {
  accounts: AccountDetailsType[];
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
