import { DataSource } from '@zamp-platform/form-builder';
import { getAccountWithLogo, getAudienceMember, getAudienceName } from 'modules/policies/commons';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { MASK_DOTS } from '@/modules/payments/payments.constant';
import { ResourceType } from '@/modules/shareResource';

export type AttributeValue = string | Record<string, string>;

export type AttributeType = {
  label: string;
} & (
  | { data_source: DataSource }
  | { options: { label: string; value: string }[] }
  | { data_source: DataSource; options: { label: string; value: string }[] }
);

export const formatAudienceMembers = (rawData: any) => {
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
};

export const attributes: AttributeType[] = [
  {
    label: 'Creator',
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
  {
    label: 'Source account',
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
