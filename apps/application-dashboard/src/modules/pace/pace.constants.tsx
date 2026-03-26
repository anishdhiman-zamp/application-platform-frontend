import { ActivityIcon, SettingsIcon } from '@zamp-platform/ui';
import { Database, Link2, UserPen } from 'lucide-react';
import { PaceNavbarItemId, PaceNavbarItemSchema, PaceSettingsTabSchema } from 'modules/pace/pace.types';
import Users02 from '@/assets/Icons/Users02';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { INPUT_FILE_FORMATS } from '@/types/common/mime';

export const ACCEPTED_FILE_TYPES = `${INPUT_FILE_FORMATS.TXT},${INPUT_FILE_FORMATS.PDF},${INPUT_FILE_FORMATS.JPEG},${INPUT_FILE_FORMATS.JPG},${INPUT_FILE_FORMATS.PNG},${INPUT_FILE_FORMATS.BMP}`;

export const DEFAULT_CHAT_TITLE = 'Untitled';
export const DEBOUNCE_DELAY_MS = 300;
export const NEW_CONVERSATION_ID = 'null_thread';
export const SIDEBAR_WIDTH = 450;
export const SIDEBAR_CONVERSATION_ID_PARAM = 's';
export const FILES_PANEL_WIDTH = 325;

export const PACE_NAVBAR_ITEMS: PaceNavbarItemSchema[] = [
  {
    id: PaceNavbarItemId.TASKS,
    iconComponent: ActivityIcon,
    path: ROUTES_PATH.CHAT_TASKS,
  },
  {
    id: PaceNavbarItemId.SETTINGS,
    iconComponent: SettingsIcon,
    path: ROUTES_PATH.CHAT_SETTINGS_PEOPLE,
  },
];

export const PACE_SETTINGS_TABS: PaceSettingsTabSchema[] = [
  {
    id: PaceNavbarItemId.GENERAL,
    name: 'General',
    iconComponent: <UserPen width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_GENERAL,
    heading: 'Account',
  },
  {
    id: PaceNavbarItemId.PEOPLE,
    name: 'Test',
    iconComponent: <Users02 width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_PEOPLE,
    heading: 'Organisation',
  },
  {
    id: PaceNavbarItemId.DATASETS,
    name: 'Datsasets',
    iconComponent: <Database width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_DATASETS,
    heading: 'Data',
  },
  {
    id: PaceNavbarItemId.INTEGRATIONS,
    name: 'Integrations',
    iconComponent: <Link2 width={16} height={16} className='-rotate-45' />,
    path: ROUTES_PATH.CHAT_SETTINGS_INTEGRATIONS,
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
