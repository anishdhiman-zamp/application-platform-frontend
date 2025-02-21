import { ADYEN, CHECKOUT, GREEN_CHECK_ICON, RED_ALERT_ICON } from 'constants/icons';

export const PIVOT_REF = '__REF';
export const NESTING_LEVEL_INFIX = '_LEVEL_';
export const GROUPING_COL_NAME_PREFIX = 'GROUPING_DEPTH_';
export const ROOT_LEVEL_TITLE = 'Total';
export enum PINNED_DIRECTION {
  LEFT = 'left',
  RIGHT = 'right',
}

export enum PIVOT_REF_TYPES {
  RECONCILLIATION = 'Reconciliation Data',
  TAGS = 'Tag',
}

export const COL_MIN_WIDTH = 170;
export const PINNED_COL_WIDTH = 380;
export const PIVOT_HEADER_HEIGHT = 70;
export const PIVOT_GROUP_HEADER_HEIGHT = 42;
export const ROW_HEIGHT = 42;
export const GRAND_ROW_TOTAL_POSITION = 'bottom';

export enum RECON_STATUS_TYPES {
  SETTLED = 'settled',
  MISSING_FROM_ACQUIRER = 'missing_from_acquirer',
  MISSING_FROM_PG = 'missing_from_pg',
  AMOUNT_MISMATCH = 'amount_mismatch',
  MISSING_FROM_INTERNAL = 'missing_from_internal',
  MISSING_FROM_STRIP = 'missing_from_stripe',
  MISSING_FROM_PARTNER = 'missing_from_partner',
  MISSING_FROM_NETSUITE = 'missing_from_netsuite',
}

export enum RECON_PAYMENT_GATEWAY_TYPES {
  CHECKOUT = 'checkout',
  ADYEN = 'adyen',
}
export const getReconStatusIcon = (status: RECON_STATUS_TYPES): string => {
  switch (status) {
    case RECON_STATUS_TYPES.SETTLED:
      return GREEN_CHECK_ICON;
    case RECON_STATUS_TYPES.MISSING_FROM_ACQUIRER:
    case RECON_STATUS_TYPES.MISSING_FROM_INTERNAL:
    case RECON_STATUS_TYPES.MISSING_FROM_PG:
    case RECON_STATUS_TYPES.MISSING_FROM_STRIP:
    case RECON_STATUS_TYPES.MISSING_FROM_PARTNER:
    case RECON_STATUS_TYPES.MISSING_FROM_NETSUITE:
    case RECON_STATUS_TYPES.AMOUNT_MISMATCH:
      return RED_ALERT_ICON;
    default:
      return GREEN_CHECK_ICON;
  }
};

export const RECON_PAYMENT_ICONS: Record<RECON_PAYMENT_GATEWAY_TYPES, string> = {
  [RECON_PAYMENT_GATEWAY_TYPES.CHECKOUT]: CHECKOUT,
  [RECON_PAYMENT_GATEWAY_TYPES.ADYEN]: ADYEN,
};

export const PIVOT_TABLE_THEME_PARAMS = {
  fontFamily: { googleFont: 'Inter' },
  rowHoverColor: '#FAFAFA',
  rowHeigh: ROW_HEIGHT,
};

export const PIVOT_GRID_OPTIONS = {
  pivotMode: true,
  suppressContextMenu: true,
  suppressMenuHide: false,
  suppressRowDrag: true,
  suppressMovableColumns: true,
  suppressCellFocus: true,
  maintainColumnOrder: true,
  scrollbarWidth: 0,
  groupMaintainOrder: true,
  columnMaintainOrder: true,
  animateRows: false,
};
