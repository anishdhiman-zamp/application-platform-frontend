import { STATUS_TYPES } from '@/modules/data/components/importDataset/importData.types';
import { AccountDetailsType, MOVE_MONEY_TYPE, PAYMENT_STATUS_TYPES } from '@/modules/payments/payments.types';
import { CreatePolicyConfigPayload, PolicyActionType, PolicyDialogType } from '@/modules/policies/types';
import { ResourceType } from '@/modules/shareResource';
import type { PolicyConfigType } from '@/types/api/policies.types';
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
    recipient_name: string;
    recipient_id: string;
  }[];
  created_by: string;
  creation_timestamp: string;
  type: MOVE_MONEY_TYPE;
  status?: STATUS_TYPES;
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
  email?: string;
  accounts?: AccountDetailsType[];
  recipient_details?: MenuItem[];
  account_name?: string;
  masked_account_number?: string;
  currency_code?: string;
  bank_name?: string;
  account_number?: string;
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
  attachments?: { file_upload_id: string }[];
};

export type SourceAccountByRecipientIdPayloadType = {
  recipient_id?: string;
};

export type PaymentConfigResponseType = {
  id: string;
};

export type PaymentDetailsResponseType = {
  amount: number;
  currency: string;
  status: PAYMENT_STATUS_TYPES;
  date: string;
  header: {
    SourceAccountDetails: string;
    Recipient: string;
  };
  sections: {
    title: string;
    values: {
      label: string;
      value: string;
    }[];
  }[];
  descriptors: {
    title: string;
    description: string[];
  }[];
  attachments: {
    label: string;
    file_upload_id: string;
  }[];
};

export interface CreatePolicyPayloadType {
  templateFor: PolicyDialogType;
  name: string;
  description?: string;
  resource_id: string;
  resource_type: string;
  action_type: 'CREATE_PAYMENT' | 'CREATE_TEMPLATE';
  config: CreatePolicyConfigPayload;
}
export type PaymentApprovalsInfoResponseType = {
  policy_evaluation_data: PolicyConfigType;
};

export type GetPoliciesParamsType = {
  resource_id?: string;
  resource_type?: ResourceType;
  action_type?: string;
};

export type PolicyDetailsType = {
  id: string;
  name: string;
  description: string;
  resource_action_type_id: string;
  organisation_id: string;
  policy_configurations: CreatePolicyConfigPayload;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  status: string;
  action_type: PolicyActionType;
};

export type GetPoliciesResponseType = {
  data: PolicyDetailsType[];
};
