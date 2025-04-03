import { ROUTES_PATH } from 'constants/routeConfig';
import { MOVE_MONEY_PAYMENT_TYPE } from 'modules/payments/payments.types';

export const CONNECT_ACCOUNT_TITLE = 'Connect accounts';
export const CONNECT_ACCOUNT_DESCRIPTION =
  'Note: Require attributes in the dataset are entity, account name, account number and currency';

export const RECIPIENT_CARD_ACTION_ITEMS = [
  {
    id: 'add-account',
    icon: {
      id: 'user-up-01',
      size: 14,
    },
    tooltipBody: 'Add account',
  },
  {
    id: 'filter-payments',
    icon: {
      id: 'filter-lines',
      size: 14,
    },
    tooltipBody: 'Filter payments',
  },
  {
    id: 'send-money',
    icon: {
      id: 'send-03',
      size: 14,
    },
    tooltipBody: 'Send Money',
  },
];

export const MOVE_MONEY_ACTION_ITEMS = [
  {
    id: 'single-payment',
    label: 'Single payment',
    url: ROUTES_PATH.MONEY_TRANSFER,
    icon: {
      id: 'arrow-narrow-right',
    },
  },
  {
    id: 'bulk-payment',
    label: 'Bulk payment',
    url: ROUTES_PATH.MONEY_TRANSFER, //to be update
    icon: {
      id: 'arrows-right',
    },
  },
  {
    id: 'self-transfer',
    label: 'Self transfer',
    url: ROUTES_PATH.MONEY_TRANSFER, //to be update
    icon: {
      id: 'refresh-ccw-02',
    },
  },
];

export const MOVE_MONEY_PAYMENT_TYPE_OPTIONS = [
  { label: 'Recipients', value: MOVE_MONEY_PAYMENT_TYPE.RECIPIENT },
  { label: 'Templates', value: MOVE_MONEY_PAYMENT_TYPE.TEMPLATES },
];

export const defaultAccountData = {
  account_id: '',
  currency_code: '',
  account_number: '',
  account_type: '',
  nick_name: '',
  bank_name: '',
  bank_identifier: '',
  balance: null,
  account_name: '',
  account_balance: null,
};

export const defaultContactDetails = { label: '', value: '' };
