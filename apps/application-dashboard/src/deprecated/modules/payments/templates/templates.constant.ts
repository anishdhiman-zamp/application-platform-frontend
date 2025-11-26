import { MOVE_MONEY_TYPE } from '@/deprecated/modules/payments/payments.types';

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

export const TITLE_MAP = {
  [MOVE_MONEY_TYPE.SELF_TRANSFER]: 'Self transfer template',
  [MOVE_MONEY_TYPE.SINGLE_TRANSFER]: 'Single payment template',
};
