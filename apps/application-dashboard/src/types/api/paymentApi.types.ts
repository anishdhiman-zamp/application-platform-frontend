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
