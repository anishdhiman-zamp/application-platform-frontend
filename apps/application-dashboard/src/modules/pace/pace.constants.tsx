import type { ConversationState } from '@zamp-platform/conversation-stream';
import { Database, KeyRound, Link2, Settings2, UserPen } from 'lucide-react';
import { type BrowserViewerStateConfig, PaceNavbarItemId, PaceSettingsTabSchema } from 'modules/pace/pace.types';
import Users02 from '@/assets/Icons/Users02';
import { DONE_EMPTY_STATE } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { INPUT_FILE_FORMATS } from '@/types/common/mime';

export const STUB_CONVERSATION_STATE: ConversationState = {
  messages: [],
  queuedMessages: [],
  hasMessages: false,
  conversationId: null,
  isStreaming: false,
  isStopping: false,
  isLoadingConversationHistory: false,
  isFetchingConversationHistory: false,
  isCreatingConversationV2: false,
  isSendingMessage: false,
  isErrorConversationHistory: false,
  errorConversationHistory: null,
  isUninitializedConversationHistory: true,
  isAnalysing: false,
  sendMessageError: null,
  sendMessageV2Error: null,
  createConversationV2Error: null,
  inputsRequired: undefined,
  isBrowserStreamingAvailable: false,
  taskSummaries: {},
  initiatedBy: null,
};

export enum BrowserViewerDisplayState {
  WAITING = 'waiting',
  ENDED = 'ended',
  ERROR = 'error',
}

export const BROWSER_VIEWER_STATE_CONFIG: Record<BrowserViewerDisplayState, BrowserViewerStateConfig> = {
  [BrowserViewerDisplayState.WAITING]: {
    title: 'Waiting for browser stream...',
    imageSrc: DONE_EMPTY_STATE,
    imageAlt: 'Waiting for stream',
  },
  [BrowserViewerDisplayState.ENDED]: {
    title: 'Live streaming has ended',
    imageSrc: DONE_EMPTY_STATE,
    imageAlt: 'Stream ended',
  },
  [BrowserViewerDisplayState.ERROR]: {
    title: 'Failed to connect to browser stream',
    imageSrc: DONE_EMPTY_STATE,
    imageAlt: 'Connection error',
    showRetry: true,
  },
};

export const ACCEPTED_FILE_TYPES = `${INPUT_FILE_FORMATS.TXT},${INPUT_FILE_FORMATS.PDF},${INPUT_FILE_FORMATS.JPEG},${INPUT_FILE_FORMATS.JPG},${INPUT_FILE_FORMATS.PNG},${INPUT_FILE_FORMATS.BMP}`;

export const DEFAULT_CHAT_TITLE = 'Start a new chat';
export const DEBOUNCE_DELAY_MS = 300;
export const NEW_CONVERSATION_ID = 'null_thread';
export const SIDEBAR_WIDTH = 450;
export const SIDEBAR_MIN_WIDTH = 345;
export const SIDEBAR_MAX_WIDTH = 700;
export const SIDEBAR_CONVERSATION_ID_PARAM = 's';
export const FILES_PANEL_WIDTH = 345;
export const FILES_PANEL_MIN_WIDTH = 200;
export const FILES_PANEL_MAX_WIDTH = 4000;
export const FILES_PANEL_WITH_VIEWER_WIDTH = 1000;
export const FILE_TREE_COLUMN_WIDTH = 300;
export const FILE_TREE_COLUMN_MIN_WIDTH = 240;
export const FILE_TREE_COLUMN_MAX_WIDTH = 480;

export const PACE_SETTINGS_TABS: PaceSettingsTabSchema[] = [
  {
    id: PaceNavbarItemId.GENERAL,
    name: 'General',
    iconComponent: <UserPen width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_GENERAL,
    heading: 'Account',
  },
  {
    id: PaceNavbarItemId.ORG_SETTINGS,
    name: 'Organisation settings',
    iconComponent: <Settings2 width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_ORG_SETTINGS,
    heading: 'Organisation',
  },
  {
    id: PaceNavbarItemId.DATASETS,
    name: 'Datasets',
    iconComponent: <Database width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_DATASETS,
  },
  {
    id: PaceNavbarItemId.INTEGRATIONS,
    name: 'Integrations',
    iconComponent: <Link2 width={16} height={16} className='-rotate-45' />,
    path: ROUTES_PATH.CHAT_SETTINGS_INTEGRATIONS,
  },
  {
    id: PaceNavbarItemId.CREDENTIALS_VAULT,
    name: 'Credentials vault',
    iconComponent: <KeyRound width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_CREDENTIALS_VAULT,
  },
  {
    id: PaceNavbarItemId.PEOPLE,
    name: 'People',
    iconComponent: <Users02 width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_PEOPLE,
  },
];

export const MORNING_GREETINGS = [
  "The day's just opened its doors.",
  "Light's in. Let's begin.",
  'First move of the day?',
  "Everything's waiting where you left it.",
];

export const AFTERNOON_GREETINGS = [
  'Right in the middle of it now.',
  'Things are moving.',
  'The pieces are on the board.',
  "You've got momentum.",
];

export const EVENING_GREETINGS = [
  'Time to bring it together.',
  'The edges are starting to meet.',
  "Let's close a few loops.",
  'Almost all in place.',
];

export const NIGHT_GREETINGS = [
  "The world's quiet. Perfect.",
  'After hours. Clear mind.',
  "Let's finish what we started.",
  'Last stretch under quiet skies.',
];

export const ACCEPTED_SKILLFILE_TYPES = ['.zip', '.skill'];

export const SKILL_FILE_REQUIREMENTS = [
  '.md file must contain skill name and description formatted in YAML',
  '.zip or .skill file must include a SKILL.md file',
];
