import {
  ACTIVITY_RUN_STATUS,
  ARTIFACT_TYPE,
  CTA_ACTION,
  CTA_COMPONENT_TYPE,
  DATE_SEPARATOR,
  LOG_STATUS,
  PDF_DATASET_TAB,
} from 'modules/process/process.types';
import { COLORS } from '@/constants/colors';
import {
  BROWSER,
  DATASET,
  DONE_EMPTY_STATE,
  FILE,
  GMAIL,
  IN_PROGRESS_EMPTY_STATE,
  NEEDS_ATTENTION_EMPTY_STATE,
} from '@/constants/icons';

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
    icon_url: DATASET,
  },
  [ARTIFACT_TYPE.EMAIL]: {
    icon_url: GMAIL,
  },
  [ARTIFACT_TYPE.BROWSER]: {
    icon_url: BROWSER,
  },
  [ARTIFACT_TYPE.PDF]: {
    icon_url: FILE,
  },
  [ARTIFACT_TYPE.DATASET]: {
    icon_url: DATASET,
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
};

export const DEFAULT_ARTIFACT_TAB = PDF_DATASET_TAB.DATASET;

export const ARTIFACT_TAB_MAPPING = {
  [CTA_ACTION.VIEW_DATASET_PDF_PDF_FIRST]: PDF_DATASET_TAB.PDF,
  [CTA_ACTION.VIEW_DATASET_PDF_DATASET_FIRST]: PDF_DATASET_TAB.DATASET,
};

export const EMPTY_STATE_BY_STATUS = {
  [ACTIVITY_RUN_STATUS.NEEDS_ATTENTION]: {
    title: 'No blockers right now',
    description: 'Sit back and let things flow, we’ll nudge you when it’s time to step in.',
    iconUrl: NEEDS_ATTENTION_EMPTY_STATE,
  },
  [ACTIVITY_RUN_STATUS.IN_PROGRESS]: {
    title: 'All clear for now',
    description: 'Looks like a quiet moment. Maybe grab a coffee?',
    iconUrl: IN_PROGRESS_EMPTY_STATE,
  },
  [ACTIVITY_RUN_STATUS.DONE]: {
    title: 'Nothing to see here yet',
    description: 'Everything that’s wrapped up nicely will land here. Sit tight!',
    iconUrl: DONE_EMPTY_STATE,
  },
  [ACTIVITY_RUN_STATUS.VOID]: {
    title: 'Nothing to see here yet',
    description: 'Any process that is void will land here.',
    iconUrl: DONE_EMPTY_STATE,
  },
  [ACTIVITY_RUN_STATUS.PAUSED]: {
    title: 'Nothing to see here yet',
    description: 'Any process that is paused will land here.',
    iconUrl: DONE_EMPTY_STATE,
  },
  [ACTIVITY_RUN_STATUS.FAILED]: {
    title: 'Nothing to see here yet',
    description: 'Any process that is failed will land here.',
    iconUrl: DONE_EMPTY_STATE,
  },
};

export const LINE_BODY_LOGS_ANIMATION_SEQUENCE = [
  // First animation: line animation
  {
    id: 'line',
    initial: { scaleY: 0 },
    animate: {
      scaleY: 1,
      transition: {
        duration: 0.5, // 500ms speed from 0 to 1
        ease: 'easeOut' as const,
      },
    },
  },
  // Second animation: body content reveal
  {
    id: 'body',
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3, // 300ms speed from 0 to 1
        ease: 'easeOut' as const,
      },
    },
  },
];

export const CTA_COMPONENT_TYPE_ICON_MAPPING = {
  [CTA_COMPONENT_TYPE.BUTTON]: 'check',
  [CTA_COMPONENT_TYPE.EMAIL_DRAFT_SEND_BUTTON]: 'check',
  [CTA_COMPONENT_TYPE.OVERRIDE_MISSING_FIELDS_BUTTON]: 'edit-01',
  [CTA_COMPONENT_TYPE.REQUIRED_MISSING_FIELDS_BUTTON]: 'edit-01',
};

export const N_A_VALUE = 'N/A';
