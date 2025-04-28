import { ROUTES_PATH } from 'constants/routeConfig';
import {
  MOVE_MONEY_ACTION_TYPE,
  MOVE_MONEY_PAYMENT_TYPE,
  MOVE_MONEY_TYPE,
  TEMPLATE_STATUS_TYPES,
} from 'modules/payments/payments.types';
import { INPUT_FILE_FORMATS } from 'types/common/mime';

export const CONNECT_ACCOUNT_TITLE = 'Connect accounts';
export const CONNECT_ACCOUNT_DESCRIPTION =
  'Note: Require attributes in the dataset are entity, account name, account number and currency';

export const FAILED_TO_CREATE_TEMPLATE = 'Failed to create template';

export const RECIPIENT_CARD_ACTION_ITEMS = [
  {
    id: 'add-account',
    action: MOVE_MONEY_ACTION_TYPE.ADD_ACCOUNT,
    icon: {
      id: 'plus',
      size: 14,
    },
    tooltipBody: 'Add account',
  },
  {
    id: 'filter-payments',
    action: MOVE_MONEY_ACTION_TYPE.FILTER_PAYMENTS,
    icon: {
      id: 'filter-lines',
      size: 14,
    },
    tooltipBody: 'Filter payments',
  },
  {
    id: 'send-money',
    action: MOVE_MONEY_ACTION_TYPE.SEND_MONEY,
    icon: {
      id: 'send-03',
      size: 14,
    },
    tooltipBody: 'Send Money',
  },
];

export const MOVE_MONEY_TEMPLATE_FILTER_ITEMS = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: TEMPLATE_STATUS_TYPES.ACTIVE,
    label: 'Active templates',
  },
  {
    value: TEMPLATE_STATUS_TYPES.DRAFTED,
    label: 'Approval pending',
  },
];

export const MOVE_MONEY_ACTION_ITEMS = [
  {
    id: 'single-payment',
    label: 'Single payment',
    url: `${ROUTES_PATH.MONEY_TRANSFER}?type=${MOVE_MONEY_TYPE.SINGLE_TRANSFER}`,
    icon: {
      id: 'arrow-narrow-right',
    },
  },
  {
    id: 'self-transfer',
    label: 'Self transfer',
    url: `${ROUTES_PATH.MONEY_TRANSFER}?type=${MOVE_MONEY_TYPE.SELF_TRANSFER}`,
    icon: {
      id: 'refresh-ccw-02',
    },
  },
  // {
  //   id: 'bulk-payment',
  //   label: 'Bulk payment',
  //   url: ROUTES_PATH.MONEY_TRANSFER, //to be update
  //   icon: {
  //     id: 'arrows-right',
  //   },
  // }
];

export const MOVE_MONEY_PAYMENT_TYPE_OPTIONS = [
  { label: 'Accounts', value: MOVE_MONEY_PAYMENT_TYPE.ACCOUNTS },
  { label: 'Templates', value: MOVE_MONEY_PAYMENT_TYPE.TEMPLATES },
];

export const defaultAccountData = {
  id: '',
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

export const MOVE_MONEY_ATTACHMENTS_FILE_FORMATS = [
  INPUT_FILE_FORMATS.XLSX,
  INPUT_FILE_FORMATS.JPEG,
  INPUT_FILE_FORMATS.JPG,
  INPUT_FILE_FORMATS.PDF,
  INPUT_FILE_FORMATS.BMP,
  INPUT_FILE_FORMATS.CSV,
];

export const MASK_DOTS = '••';
