import { STATUS_TYPES } from '@/modules/data/components/importDataset/importData.types';

export const PAYMENT_DETAILS_MOCK = {
  date: '23 Oct 2024 at 6:39pm',
  amount: 'USD 12,090.00',
  from: 'JP Morgan Chase •• 4435',
  to: 'Raghav Saraf',
  status: STATUS_TYPES.PENDING,
  details: [
    {
      title: 'Additional information',
      data: [
        {
          label: 'Transaction id',
          value: 'JP Morgan Chase ',
        },
        {
          label: 'Fee strategy',
          value: '12746783549',
        },
        {
          label: 'Bulk payout id',
          value: '12746783549',
        },
        {
          label: 'Purpose code',
          value: '12746783549',
        },
      ],
    },
    {
      title: 'Contact Details',
      data: [
        {
          label: 'Account number',
          value: 'JP Morgan Chase ',
        },
        {
          label: 'Account holder name',
          value: '12746783549',
        },
        {
          label: 'Bank name',
          value: '12746783549',
        },
        {
          label: 'Bank identifier',
          value: '12746783549',
        },
      ],
    },
  ],
  extraDetails: [
    {
      label: 'Memo for recipient',
      value: 'This is new payment schedule since from the last month, bill amount is updated',
    },
    {
      label: 'Notes',
      value: 'This is new payment schedule since from the last month, bill amount is updated',
    },
  ],
  attachments: [
    {
      label: 'file_name_abracadabra.pdf',
      value: 'file_name_abracadabasra.pdf',
    },
    {
      label: 'file_name_abracadabra.pdf',
      value: 'file_name_abracadabasra.pdf',
    },
  ],
};
