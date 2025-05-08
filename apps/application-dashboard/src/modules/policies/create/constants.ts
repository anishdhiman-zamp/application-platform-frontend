import { getAccountWithLogo, getAudienceLabel, getAudienceMember, getAudienceName } from 'modules/policies/commons';
import { AttributeType } from 'modules/policies/types';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { MASK_DOTS } from '@/modules/payments/payments.constant';
import { ResourceType } from '@/modules/shareResource';
import { getCommaSeparatedNumber } from '@/utils/common';

export const formatAudienceMembers = (rawData: any) => {
  return rawData.map((item: any) => ({
    id: item.resource_audience_id,
    label: item.name ?? getAudienceLabel(item),
    richLabel: getAudienceMember(item),
    display_value: getAudienceName(item),
    value: {
      type: item.resource_audience_type,
      id: item.resource_audience_id,
    },
  }));
};

export const attributesMap: Record<string, AttributeType> = {
  source_accounts: {
    label: 'Source account',
    id: 'source_accounts',
    type: 'multi-select',
    operator: 'in',
    formFieldType: 'condition',
    data_source: {
      endpoint: 'payments/source-accounts',
      method: 'GET',
      valueFormatter: (rawData) => {
        const data = rawData.accounts;

        return data.map((item: any) => ({
          id: item.account_number,
          label: item.account_name,
          richLabel: getAccountWithLogo(item),
          display_value: `${MASK_DOTS}  ${item?.masked_account_number}`,
          value: item.account_number,
        }));
      },
    },
  },
  recipients: {
    label: 'Recipients',
    id: 'recipients',
    operator: 'in',
    type: 'multi-select',
    formFieldType: 'condition',
    options: [
      {
        id: 'Single',
        label: 'Single',
        value: 'contact',
        display_value: 'Single',
      },
      {
        id: 'Self',
        label: 'Self',
        value: 'internal',
        display_value: 'Self',
      },
    ],
  },
  is_template_based_payment: {
    label: 'Payment Type',
    id: 'is_template_based_payment',
    type: 'select',
    operator: '==',
    formFieldType: 'condition',
    options: [
      {
        id: 'Single',
        label: 'Single',
        value: false,
        display_value: 'Single',
      },
      {
        id: 'Template',
        label: 'Template',
        value: true,
        display_value: 'Template',
      },
    ],
  },
  entities: {
    label: 'Entities',
    id: 'entities',
    type: 'multi-select',
    operator: 'in',
    formFieldType: 'condition',
    data_source: {
      endpoint: 'payments/entities',
      method: 'GET',
      valueFormatter: (rawData) => {
        const data = rawData.entities;

        return data.map((item: string) => ({
          id: item,
          label: item,
          display_value: item,
          value: item,
        }));
      },
    },
  },
  action: {
    label: 'Action',
    type: 'select',
    id: 'action',
    operator: '==',
    formFieldType: 'input',
    defaultValue: 'REQUIRE_APPROVAL',
    validations: [
      {
        type: 'required',
        config: {
          message: 'Action is required',
        },
      },
    ],
    options: [
      {
        id: 'Send for Approval',
        label: 'Send for Approval',
        value: 'REQUIRE_APPROVAL',
        display_value: 'Send for Approval',
      },
      {
        id: 'Block',
        label: 'Block',
        value: 'BLOCK',
        display_value: 'Block',
      },
    ],
  },
  amount: {
    label: 'Amount',
    type: 'input',
    displayValueFormatter: getCommaSeparatedNumber,
    id: 'amount',
    operator: '>',
    formFieldType: 'condition',
    input_config: {
      type: 'number',
      placeholder: 'type a value',
      label: 'Amount',
      prefix_text: 'is greater than',
      suffix_text: 'USD',
      min: 0,
    },
  },
  initiator: {
    label: 'Initiator',
    type: 'multi-select',
    id: 'creator',
    operator: '==',
    formFieldType: 'creator',
    data_source: {
      endpoint: 'payments/audiences',
      method: 'GET',
      useCustomHook: useAudienceMembers,
      valueFormatter: formatAudienceMembers,
      params: {
        resourceType: ResourceType.PAYMENTS,
        resourceId: '',
      },
    },
  },
  creator: {
    label: 'Creator',
    id: 'creator',
    type: 'multi-select',
    operator: '==',
    formFieldType: 'creator',
    data_source: {
      endpoint: 'payments/audiences',
      method: 'GET',
      useCustomHook: useAudienceMembers,
      valueFormatter: (rawData) => {
        return rawData.map((item: any) => ({
          id: item.resource_audience_id,
          label: item.name ?? '',
          richLabel: getAudienceMember(item),
          display_value: getAudienceName(item),
          value: {
            type: item.resource_audience_type,
            id: item.resource_audience_id,
          },
        }));
      },
      params: {
        resourceType: ResourceType.PAYMENTS,
        resourceId: '',
      },
    },
  },
};
export const commonAttributes = ['source_accounts', 'recipients', 'action'];

export const payoutAttributes = ['amount', 'initiator', 'entities', 'is_template_based_payment', ...commonAttributes];

export const templateAttributes = ['creator', ...commonAttributes];
