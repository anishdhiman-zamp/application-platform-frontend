import { DatasetFilterConfigResponseType } from 'types/api/dataset.types';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';
import { FILTER_TYPES } from 'components/filter/filter.types';

export const PAGES_ITEMS = [
  {
    label: 'Daily Liquidity Summary',
    iconId: 'notebook',
  },
  {
    label: 'Cash Summary',
    iconId: 'notebook',
  },
  {
    label: 'Bank Account Balances',
    iconId: 'notebook',
  },
  {
    label: 'Cash Positioning',
    iconId: 'notebook',
  },
];

export const WORKSPACE_ITEMS = [
  {
    label: 'Reconciliation',
    workspace_id: 'reconciliation',
    color: '#40A97F',
  },
  {
    label: 'Cash Management',
    workspace_id: 'cash-management',
    color: '#0052D6',
  },
  {
    label: 'Financial Forecasting',
    workspace_id: 'financial-forecasting',
    color: '#BF0000',
  },
];

export const barGraphInstance = {
  instance_id: 'currency_volume_analysis',
  widget_id: 1,
  type: 'bar',
  title: 'Transaction Volume by Currency',
  data_mappings: {
    datasets: [
      {
        id: 'CashOpsBankTransactions',
      },
    ],
    mappings: {
      x_axis: {
        field: 'CurrencyCode',
      },
      y_axis: {
        field: 'IntegerAmount',
        aggregation: 'sum',
      },
    },
  },
  visual_config: {},
};

export const barGraphData = {
  result: [
    {
      status: 'success',
      error: null,
      rowcount: 5,
      columns: [
        {
          column_name: 'CurrencyCode',
          column_type: 'STRING',
        },
        {
          column_name: 'SUM(IntegerAmount)',
          column_type: 'NUMBER',
        },
      ],
      data: [
        {
          CurrencyCode: 'USD',
          IntegerAmount: 1543437.0,
          IntegerAmountV2: 1543437.0,
        },
        {
          CurrencyCode: 'EUR',
          IntegerAmount: 756909.0,
          IntegerAmountV2: 756909.0,
        },
        {
          CurrencyCode: 'GBP',
          IntegerAmount: 432224.0,
          IntegerAmountV2: 432224.0,
        },
        {
          CurrencyCode: 'JPY',
          IntegerAmount: 234567.0,
          IntegerAmountV2: 234567.0,
        },
        {
          CurrencyCode: 'SGD',
          IntegerAmount: 123456.0,
          IntegerAmountV2: 123456.0,
        },
      ],
    },
  ],
};

export const columns: DatasetFilterConfigResponseType[] = [
  {
    column: 'Tags',
    datatype: 'STRING',
    type: FILTER_TYPES.MULTI_SELECT,
    options: ['Tag1.Tag2.Tag3', 'Tag2.Tag3.Tag4.Tag5', 'Tag3.Tag4'],
    metadata: {
      custom_type: CUSTOM_COLUMNS_TYPE.TAG,
      is_editable: true,
    },
  },
  {
    column: 'Date',
    datatype: 'DATE',
    type: FILTER_TYPES.DATE_RANGE,
    metadata: {
      custom_type: CUSTOM_COLUMNS_TYPE.DATE_TIME,
      is_editable: true,
      format: 'dd-MM-yyyy',
    },
    options: [],
  },
  {
    column: 'Amount',
    datatype: 'NUMBER',
    type: FILTER_TYPES.AMOUNT_RANGE,
    metadata: {
      custom_type: CUSTOM_COLUMNS_TYPE.AMOUNT,
      is_editable: true,
      currency_column_prefix: 'Currency',
    },
    options: [],
  },
  {
    column: 'Status',
    datatype: 'STRING',
    type: FILTER_TYPES.MULTI_SELECT,
    options: ['success', 'failed', 'pending'],
    metadata: {
      is_editable: true,
    },
  },
  {
    column: 'Description',
    datatype: 'STRING',
    type: FILTER_TYPES.SEARCH,
    metadata: {
      is_editable: true,
    },
    options: [],
  },
  {
    column: 'Currency',
    datatype: 'STRING',
    type: FILTER_TYPES.MULTI_SELECT,
    options: ['USD', 'EUR', 'GBP', 'JPY', 'SGD'],
    metadata: {
      is_editable: true,
    },
  },
];

export const rows = [
  {
    Tags: 'Tag1',
    Date: '2024-06-27T15:55:49.007799Z',
    Amount: 1000,
    Status: 'success',
    Description: 'Description1',
    Currency: 'USD',
  },
  {
    Tags: 'Tag2',
    Date: '2024-06-27T15:55:49.007799Z',
    Amount: 2000,
    Status: 'failed',
    Description: 'Description2',
    Currency: 'EUR',
  },
];

export const tagsList = ['Tag1.Tag2.Tag3', 'Tag2.Tag3.Tag4.Tag5', 'Tag3.Tag4'];
