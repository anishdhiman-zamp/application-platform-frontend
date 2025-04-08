import { MOVE_MONEY_TYPE } from 'modules/payments/payments.types';

export const TEMPLATE_LIST_TABS = [
  {
    label: 'Single Payment',
    value: MOVE_MONEY_TYPE.SINGLE_TRANSFER,
  },
  {
    label: 'Self Payment',
    value: MOVE_MONEY_TYPE.SELF_TRANSFER,
  },
];
