import {
  ACTIVITY_RUN_STATUS,
  ARTIFACT_TYPE,
  CTA_ACTION,
  DATE_SEPARATOR,
  LOG_STATUS,
  PDF_DATASET_TAB,
} from 'modules/process/process.types';
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
    label: 'Needs attention',
  },
  [ACTIVITY_RUN_STATUS.VOID]: {
    tabStatusIcon: {
      fillColor: COLORS.GRAY_400,
      strokeColor: COLORS.GRAY_700,
    },
    tableStatusIcon: {
      color: COLORS.GRAY_700,
    },
    label: 'Void',
  },
  [ACTIVITY_RUN_STATUS.IN_PROGRESS]: {
    tabStatusIcon: {
      fillColor: COLORS.BLUE_100,
      strokeColor: COLORS.BLUE_700,
    },
    tableStatusIcon: {
      color: COLORS.BLUE_700,
    },
    label: 'In progress',
  },
  [ACTIVITY_RUN_STATUS.DONE]: {
    tabStatusIcon: {
      fillColor: COLORS.GREEN_200,
      strokeColor: COLORS.GREEN_300,
    },
    tableStatusIcon: {
      color: COLORS.GREEN_300,
    },
    label: 'Done',
  },
  [ACTIVITY_RUN_STATUS.PAUSED]: {
    tabStatusIcon: {
      fillColor: COLORS.YELLOW_200,
      strokeColor: COLORS.YELLOW_200,
    },
    tableStatusIcon: {
      color: COLORS.YELLOW_200,
    },
    label: 'Paused',
  },
  [ACTIVITY_RUN_STATUS.FAILED]: {
    tabStatusIcon: {
      fillColor: COLORS.RED_100,
      strokeColor: COLORS.RED_800,
    },
    tableStatusIcon: {
      color: COLORS.RED_800,
    },
    label: 'Failed',
  },
};

export const ARTIFACT_ICON_MAPPING = {
  [ARTIFACT_TYPE.PDF_DATASET]: {
    id: 'coins-stacked-04',
  },
  [ARTIFACT_TYPE.EMAIL]: {
    id: 'mail-01',
  },
  [ARTIFACT_TYPE.BROWSER]: {
    id: 'file-02',
  },
};

export enum RESIZABLE_PANEL_ID {
  SUMMARY = 'summary',
  ARTIFACTS = 'artifacts',
  LOGS = 'logs',
}

export const RESIZABLE_PANEL_MAPPING = {
  [RESIZABLE_PANEL_ID.SUMMARY]: {
    id: 'summary',
    defaultSize: 30,
  },
  [RESIZABLE_PANEL_ID.ARTIFACTS]: {
    id: 'artifacts',
    defaultSize: 50,
  },
  [RESIZABLE_PANEL_ID.LOGS]: {
    id: 'logs',
    defaultSize: 70,
    minSize: 30,
    maxSize: 70,
  },
};

export const LOG_STATUS_ICON_COLOR_MAPPING = {
  [LOG_STATUS.FAILED]: {
    fillColor: COLORS.RED_300,
    strokeColor: COLORS.RED_300,
  },
  [LOG_STATUS.NEEDS_ATTENTION]: {
    fillColor: COLORS.ORANGE_200,
    strokeColor: COLORS.ORANGE_600,
  },
  [LOG_STATUS.LOADING]: {
    fillColor: COLORS.GRAY_300,
    strokeColor: COLORS.GRAY_300,
  },
  [LOG_STATUS.DONE]: {
    fillColor: COLORS.GREEN_400,
    strokeColor: COLORS.GREEN_400,
  },
  [LOG_STATUS.SUCCESS]: {
    fillColor: COLORS.GREEN_400_ALPHA,
    strokeColor: COLORS.GREEN_400,
  },
  [LOG_STATUS.MESSAGE_FROM_USER]: {
    fillColor: COLORS.BLUE_200,
    strokeColor: COLORS.BLUE_500,
  },
  [LOG_STATUS.MESSAGE_FROM_ADAM]: {
    fillColor: COLORS.VIOLET_200,
    strokeColor: COLORS.VIOLET_300,
  },
  [LOG_STATUS.VOID]: {
    fillColor: COLORS.GRAY_400,
    strokeColor: COLORS.GRAY_700,
  },
};

export const MAX_TEXTAREA_HEIGHT = 192;

export const DATE_SEPARATOR_MAPPING = {
  [DATE_SEPARATOR.TODAY]: 'Today',
  [DATE_SEPARATOR.YESTERDAY]: 'Yesterday',
  [DATE_SEPARATOR.OTHER]: 'Other',
};

export const DEFAULT_ARTIFACT_TAB = PDF_DATASET_TAB.DATASET;
export const ARTIFACT_TAB_MAPPING = {
  [CTA_ACTION.VIEW_DATASET_PDF_FIRST]: PDF_DATASET_TAB.DATASET,
  [CTA_ACTION.VIEW_DATASET_PDF_DATASET_FIRST]: PDF_DATASET_TAB.PDF,
};
