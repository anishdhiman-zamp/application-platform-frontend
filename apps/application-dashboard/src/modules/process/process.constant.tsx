import React from 'react';
import {
  Calendar,
  Database,
  FilePen,
  FileText,
  Hash,
  Image,
  Link,
  Mail,
  Sheet,
  SquareMousePointer,
  Type,
} from 'lucide-react';
import {
  ACTIVITY_RUN_STATUS,
  ARTIFACT_TYPE,
  CTA_ACTION,
  CTA_COMPONENT_TYPE,
  DatasetColumnHeaderTypes,
  DatasetColumnTypes,
  DatasetTabsTypes,
  DATE_SEPARATOR,
  LOG_STATUS,
  PDF_DATASET_TAB,
} from 'modules/process/process.types';
import { COLORS } from '@/constants/colors';
import { DONE_EMPTY_STATE, IN_PROGRESS_EMPTY_STATE, NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';

export const STATUS_ICON_COLOR_MAPPING = {
  [ACTIVITY_RUN_STATUS.NEEDS_ATTENTION]: {
    tabStatusIcon: {
      fillColor: COLORS.RED_200,
      strokeColor: COLORS.RED_900,
    },
    tableStatusIcon: {
      color: COLORS.RED_900,
    },
    label: 'Needs attention',
  },
  [ACTIVITY_RUN_STATUS.NEEDS_REVIEW]: {
    tabStatusIcon: {
      fillColor: COLORS.ORANGE_200,
      strokeColor: COLORS.ORANGE_300,
    },
    tableStatusIcon: {
      color: COLORS.ORANGE_300,
    },
    label: 'Needs review',
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
    icon: Database,
  },
  [ARTIFACT_TYPE.BROWSER]: {
    icon: SquareMousePointer,
  },
  [ARTIFACT_TYPE.PDF]: {
    icon: FileText,
  },
  [ARTIFACT_TYPE.DATASET]: {
    icon: Database,
  },
  [ARTIFACT_TYPE.IMAGE]: {
    icon: Image,
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
  [ACTIVITY_RUN_STATUS.NEEDS_REVIEW]: {
    title: 'Nothing to review right now',
    description: 'Everything that needs to be reviewed will land here.',
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

export const ACTIVITY_RUNS_TABLE_COLUMNS_HEADER_WIDTH: number[] = [28, 182, 786, 134, 134, 210, 134];
export const N_A_VALUE = 'N/A';

export const DATASET_PLAYGROUND_TABS_LIST = [
  { label: 'Blueprint', value: DatasetTabsTypes.BLUEPRINT, icon: <FilePen size={12} /> },
  { label: 'Preview', value: DatasetTabsTypes.PREVIEW, icon: <Sheet size={12} /> },
];

export const DATASET_COLUMN_HEADERS_LIST = [
  { label: 'Column Name', value: DatasetColumnHeaderTypes.COLUMN_NAME },
  { label: 'Column Type', value: DatasetColumnHeaderTypes.COLUMN_TYPE, width: 200 },
  { label: 'Required', value: DatasetColumnHeaderTypes.REQUIRED },
  { label: '', value: DatasetColumnHeaderTypes.ACTIONS, width: 20 },
];

export const DATASET_COLUMN_TYPES_LIST = [
  { label: 'Text', value: DatasetColumnTypes.TEXT, icon: Type },
  { label: 'File', value: DatasetColumnTypes.FILE, icon: FileText },
  { label: 'Link', value: DatasetColumnTypes.LINK, icon: Link },
  { label: 'Date', value: DatasetColumnTypes.DATE, icon: Calendar },
  { label: 'Number', value: DatasetColumnTypes.NUMBER, icon: Hash },
  { label: 'Email', value: DatasetColumnTypes.EMAIL, icon: Mail },
];

// CTA Button type components for filtering
export const BUTTON_TYPE_CTA_COMPONENTS: CTA_COMPONENT_TYPE[] = [
  CTA_COMPONENT_TYPE.BUTTON,
  CTA_COMPONENT_TYPE.OVERRIDE_MISSING_FIELDS_BUTTON,
  CTA_COMPONENT_TYPE.REQUIRED_MISSING_FIELDS_BUTTON,
  CTA_COMPONENT_TYPE.EMAIL_DRAFT_SEND_BUTTON,
];

// CTA types that should show artifacts instead of emitting HITL action
export const ARTIFACT_SHOW_CTA_TYPES: CTA_COMPONENT_TYPE[] = [
  CTA_COMPONENT_TYPE.REQUIRED_MISSING_FIELDS_BUTTON,
  CTA_COMPONENT_TYPE.EMAIL_DRAFT_SEND_BUTTON,
];

export const PACE_MESSAGES = [
  'Hey! Pace here.',
  "Let's create a process",
  "I'm following your instructions",
  "What's this?",
  'Show me more!',
  'Interesting...',
  'Analyzing...',
  'Awaiting input',
  'Scanning pattern',
];

export const PACE_MOVE_MESSAGES = ['Oh!', 'Here?', 'Checking...', 'On my way'];
