import { ACTIVITY_RUN_STATUS, ARTIFACT_TYPE } from 'modules/process/process.types';
import { COLORS } from '@/constants/colors';

export const STATUS_ICON_COLOR_MAPPING = {
  [ACTIVITY_RUN_STATUS.NEEDS_ATTENTION]: {
    tabStatusIcon: {
      fillColor: COLORS.ORANGE_200,
      strokeColor: COLORS.ORANGE_300,
    },
    tableStatusIcon: {
      color: COLORS.ORANGE_300,
    },
  },
  [ACTIVITY_RUN_STATUS.VOID]: {
    tabStatusIcon: {
      fillColor: COLORS.GRAY_400,
      strokeColor: COLORS.GRAY_700,
    },
    tableStatusIcon: {
      color: COLORS.GRAY_700,
    },
  },
  [ACTIVITY_RUN_STATUS.IN_PROGRESS]: {
    tabStatusIcon: {
      fillColor: COLORS.BLUE_100,
      strokeColor: COLORS.BLUE_700,
    },
    tableStatusIcon: {
      color: COLORS.BLUE_700,
    },
  },
  [ACTIVITY_RUN_STATUS.DONE]: {
    tabStatusIcon: {
      fillColor: COLORS.GREEN_200,
      strokeColor: COLORS.GREEN_300,
    },
    tableStatusIcon: {
      color: COLORS.GREEN_300,
    },
  },
  [ACTIVITY_RUN_STATUS.PAUSED]: {
    tabStatusIcon: {
      fillColor: COLORS.YELLOW_200,
      strokeColor: COLORS.YELLOW_200,
    },
    tableStatusIcon: {
      color: COLORS.YELLOW_200,
    },
  },
  [ACTIVITY_RUN_STATUS.FAILED]: {
    tabStatusIcon: {
      fillColor: COLORS.RED_100,
      strokeColor: COLORS.RED_800,
    },
    tableStatusIcon: {
      color: COLORS.RED_800,
    },
  },
};

export const ARTIFACT_ICON_MAPPING = {
  [ARTIFACT_TYPE.DOCUMENT]: {
    id: 'file-05',
  },
  [ARTIFACT_TYPE.VIDEO]: {
    id: 'file-05',
  },
  [ARTIFACT_TYPE.DATASET]: {
    id: 'coins-stacked-04',
  },
  [ARTIFACT_TYPE.EMAIL]: {
    id: 'mail-01',
  },
};
