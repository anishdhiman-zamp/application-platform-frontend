import { DATE_FORMATS } from '@zamp-platform/utils';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { CustomHeaderMenuOptionTypes } from 'components/common/table/CustomHeader/customHeader.types';
import { CUSTOM_COLUMNS_TYPE } from 'components/common/table/table.types';

export const CustomHeaderMenuOptions = [
  {
    label: 'Rules',
    value: CustomHeaderMenuOptionTypes.RULES,
    iconId: 'lightning-01',
  },
  {
    label: 'Sort Ascending',
    value: CustomHeaderMenuOptionTypes.SORT_ASC,
    iconId: 'arrow-up',
  },
  {
    label: 'Sort Descending',
    value: CustomHeaderMenuOptionTypes.SORT_DESC,
    iconId: 'arrow-down',
  },
  {
    label: 'Remove Sort',
    value: CustomHeaderMenuOptionTypes.REMOVE_SORT,
    iconId: 'x-close',
  },
  {
    label: 'Filter',
    value: CustomHeaderMenuOptionTypes.FILTER,
    iconId: 'filter-lines',
  },
  {
    label: 'Hide column',
    value: CustomHeaderMenuOptionTypes.HIDE_COLUMN,
    iconId: 'eye-off',
  },
];

export const DateFormatOptions = [
  {
    label: 'Full Date',
    value: DATE_FORMATS.ddMMMyyyy,
  },
  {
    label: 'mm/dd/yyyy',
    value: DATE_FORMATS.MMddyyyy,
  },
  {
    label: 'dd/mm/yyyy',
    value: DATE_FORMATS.ddMMyyyy,
  },
  {
    label: 'yyyy/mm/dd',
    value: DATE_FORMATS.YYYYMMDD_SLASH,
  },
  {
    label: 'Relative',
    value: DATE_FORMATS.RELATIVE,
  },
];

export const DisplayTypeOptions = [
  {
    label: 'Chips',
    value: CUSTOM_COLUMNS_TYPE.CHIP,
  },
  {
    label: 'Tags',
    value: CUSTOM_COLUMNS_TYPE.TAG,
  },
  {
    label: 'Default',
    value: '',
  },
];

export const DisplayTypeNonApplicableFilterTypes = [FILTER_TYPES.AMOUNT_RANGE, FILTER_TYPES.DATE_RANGE];
