import { COLORS } from 'constants/colors';
import { ADYEN, CHECKOUT, ICON_SPRITE_TYPES } from 'constants/icons';

export const PIVOT_REF = '__REF';
export const NESTING_LEVEL_INFIX = '_LEVEL_';
export const GROUPING_COL_NAME_PREFIX = 'GROUPING_DEPTH_';
export const ROOT_LEVEL_TITLE = 'Total';

export const COL_MIN_WIDTH = 170;
export const PINNED_COL_WIDTH = 380;
export const PIVOT_HEADER_HEIGHT = 64;
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

const createIcon = (id: string, iconCategory: ICON_SPRITE_TYPES, color: string) => ({
  id,
  iconCategory,
  color,
});

export const RECON_STATUS_ICONS: Record<
  RECON_STATUS_TYPES,
  { id: string; iconCategory: ICON_SPRITE_TYPES; color: string }
> = {
  [RECON_STATUS_TYPES.SETTLED]: createIcon('check-circle', ICON_SPRITE_TYPES.GENERAL, COLORS.GREEN_PRIMARY),
  [RECON_STATUS_TYPES.MISSING_FROM_ACQUIRER]: createIcon(
    'alert-circle',
    ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK,
    COLORS.RED_PRIMARY,
  ),
  [RECON_STATUS_TYPES.MISSING_FROM_INTERNAL]: createIcon(
    'alert-circle',
    ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK,
    COLORS.RED_PRIMARY,
  ),
  [RECON_STATUS_TYPES.MISSING_FROM_PG]: createIcon(
    'alert-circle',
    ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK,
    COLORS.RED_PRIMARY,
  ),
  [RECON_STATUS_TYPES.MISSING_FROM_STRIP]: createIcon(
    'alert-circle',
    ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK,
    COLORS.RED_PRIMARY,
  ),
  [RECON_STATUS_TYPES.MISSING_FROM_PARTNER]: createIcon(
    'alert-circle',
    ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK,
    COLORS.RED_PRIMARY,
  ),
  [RECON_STATUS_TYPES.MISSING_FROM_NETSUITE]: createIcon(
    'alert-circle',
    ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK,
    COLORS.RED_PRIMARY,
  ),
  [RECON_STATUS_TYPES.AMOUNT_MISMATCH]: createIcon(
    'alert-circle',
    ICON_SPRITE_TYPES.ALERTS_AND_FEEDBACK,
    COLORS.RED_PRIMARY,
  ),
};

export const RECON_PAYMENT_ICONS: Record<RECON_PAYMENT_GATEWAY_TYPES, string> = {
  [RECON_PAYMENT_GATEWAY_TYPES.CHECKOUT]: CHECKOUT,
  [RECON_PAYMENT_GATEWAY_TYPES.ADYEN]: ADYEN,
};
