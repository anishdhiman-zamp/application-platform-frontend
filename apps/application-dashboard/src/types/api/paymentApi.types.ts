import { AccountDetailsType } from '@/modules/payments/payments.types';

export type SourceAccountResponseType = {
  accounts: AccountDetailsType[];
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
    beneficiary_id: string;
  }[];
  description: string;
  type: string;
};
