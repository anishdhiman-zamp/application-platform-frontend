import { RADIO_STATE_TYPES, RADIO_TYPES } from 'types/common/components/radio';

export const RADIO_STATE_STYLES = {
  [RADIO_TYPES.SELECTED]: {
    [RADIO_STATE_TYPES.ENABLED]: 'tw-cursor-pointer tw-border-TEXT_PRIMARY',
    [RADIO_STATE_TYPES.HOVER]: 'hover:tw-bg-white hover:tw-ring-[14px] hover:tw-ring-LIGHT_PRIMARY_1',
    [RADIO_STATE_TYPES.PRESSED]: 'active:tw-bg-TEXT_PRIMARY hover:tw-ring-LIGHT_PRIMARY_2',
    [RADIO_STATE_TYPES.DISABLED]: 'tw-cursor-not-allowed tw-border-DIVIDER_GRAY tw-bg-white',
  },
  [RADIO_TYPES.UNSELECTED]: {
    [RADIO_STATE_TYPES.ENABLED]: 'tw-cursor-pointer tw-border-DIVIDER_GRAY tw-bg-white',
    [RADIO_STATE_TYPES.HOVER]:
      'hover:tw-bg-white hover:tw-border-TEXT_PRIMARY hover:tw-ring-[14px] hover:tw-ring-LIGHT_PRIMARY_1',
    [RADIO_STATE_TYPES.PRESSED]: 'active:tw-bg-TEXT_PRIMARY hover:tw-ring-LIGHT_PRIMARY_2',
    [RADIO_STATE_TYPES.DISABLED]: 'tw-cursor-not-allowed tw-border-DIVIDER_GRAY tw-bg-BASE_PRIMARY',
  },
};
