import { DataSource } from '@zamp-platform/form-builder';
import { getAccountWithLogo, getAudienceMember, getAudienceName } from 'modules/policies/commons';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { MASK_DOTS } from '@/modules/payments/payments.constant';
import { ResourceType } from '@/modules/shareResource';
import { getCommaSeparatedNumber } from '@/utils/common';

export type AttributeValue = string | Record<string, string>;

export interface InputConfig {
  type: 'number' | 'text' | 'date' | 'datetime';
  placeholder?: string;
  label?: string;
  suffix_text?: string;
  prefix_text?: string;
  min?: number;
  max?: number;
}

export type AttributeType = {
  label: string;
  type: 'input' | 'select' | 'multi-select';
  displayValueFormatter?: (value: number | string) => string;
} & (
  | { data_source: DataSource }
  | { options: { label: string; value: string }[] }
  | { data_source: DataSource; options: { label: string; value: string }[] }
  | { input_config: InputConfig }
);

export const commonAttributes: AttributeType[] = [
  {
    label: 'Source account',
    type: 'multi-select',
    data_source: {
      endpoint: 'payments/source-accounts',
      method: 'GET',
      valueFormatter: (rawData) => {
        const data = rawData.accounts;

        return data.map((item: any) => ({
          id: item.id,
          label: item.account_name,
          richLabel: getAccountWithLogo(item),
          displayValue: `${MASK_DOTS}  ${item?.masked_account_number}`,
          value: item.id,
        }));
      },
    },
  },
  {
    label: 'Recipient',
    type: 'multi-select',
    options: [
      {
        label: 'Single',
        value: 'contact',
      },
      {
        label: 'Self',
        value: 'internal',
      },
    ],
  },
  {
    label: 'Action',
    type: 'multi-select',
    options: [
      {
        label: 'Send for Approval',
        value: 'REQUIRE_APPROVAL',
      },
      {
        label: 'Block',
        value: 'BLOCK',
      },
    ],
  },
];

export const payoutAttributes: AttributeType[] = [
  {
    label: 'Amount',
    type: 'input',
    displayValueFormatter: getCommaSeparatedNumber,
    input_config: {
      type: 'number',
      placeholder: 'type a value',
      label: 'Amount',
      prefix_text: 'is greater than',
      suffix_text: 'USD',
    },
  },

  {
    label: 'Initiator',
    type: 'multi-select',
    data_source: {
      endpoint: 'payments/audiences',
      method: 'GET',
      useCustomHook: useAudienceMembers,
      valueFormatter: (rawData) => {
        return rawData.map((item: any) => ({
          id: item.resource_audience_id,
          label: item.name ?? '',
          richLabel: getAudienceMember(item),
          displayValue: getAudienceName(item),
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
  ...commonAttributes,
];

export const templateAttributes: AttributeType[] = [
  {
    label: 'Creator',
    type: 'multi-select',
    data_source: {
      endpoint: 'payments/audiences',
      method: 'GET',
      useCustomHook: useAudienceMembers,
      valueFormatter: (rawData) => {
        return rawData.map((item: any) => ({
          id: item.resource_audience_id,
          label: item.name ?? '',
          richLabel: getAudienceMember(item),
          displayValue: getAudienceName(item),
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
  ...commonAttributes,
];
