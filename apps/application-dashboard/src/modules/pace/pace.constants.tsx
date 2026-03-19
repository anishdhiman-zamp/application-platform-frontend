import { FolderOpenIcon, HomeIcon, SettingsIcon } from '@zamp-platform/ui';
import { Activity, Link2, UserPen } from 'lucide-react';
import { PaceNavbarItemId, PaceNavbarItemSchema, PaceSettingsTabSchema } from 'modules/pace/pace.types';
import Users02 from '@/assets/Icons/Users02';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { INPUT_FILE_FORMATS } from '@/types/common/mime';

export const ACCEPTED_FILE_TYPES = `${INPUT_FILE_FORMATS.TXT},${INPUT_FILE_FORMATS.PDF},${INPUT_FILE_FORMATS.JPEG},${INPUT_FILE_FORMATS.JPG},${INPUT_FILE_FORMATS.PNG},${INPUT_FILE_FORMATS.BMP}`;

export const DEFAULT_CHAT_TITLE = 'Untitled';
export const DEBOUNCE_DELAY_MS = 300;
export const NEW_CONVERSATION_ID = 'null_thread';
export const SIDEBAR_WIDTH = 400;
export const SIDEBAR_MIN_WIDTH = 400;
export const SIDEBAR_MAX_WIDTH = 600;
export const SIDEBAR_CONVERSATION_ID_PARAM = 's';
export const CHAT_CONVERSATION_ID_PARAM = 'c';

export const PACE_NAVBAR_ITEMS: PaceNavbarItemSchema[] = [
  {
    id: PaceNavbarItemId.HOME,
    iconComponent: <HomeIcon size={16} />,
    path: ROUTES_PATH.CHAT,
  },
  {
    id: PaceNavbarItemId.TASKS,
    iconComponent: <Activity size={16} />,
    path: ROUTES_PATH.CHAT_TASKS,
  },
  {
    id: PaceNavbarItemId.FILES,
    iconComponent: <FolderOpenIcon size={16} />,
    path: ROUTES_PATH.CHAT_FILES,
  },
  {
    id: PaceNavbarItemId.SETTINGS,
    iconComponent: <SettingsIcon size={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_PEOPLE,
  },
];

export const PACE_SETTINGS_TABS: PaceSettingsTabSchema[] = [
  {
    id: PaceNavbarItemId.PEOPLE,
    name: 'People',
    iconComponent: <Users02 width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_PEOPLE,
  },
  {
    id: PaceNavbarItemId.INTEGRATIONS,
    name: 'Integrations',
    iconComponent: <Link2 width={16} height={16} className='-rotate-45' />,
    path: ROUTES_PATH.CHAT_SETTINGS_INTEGRATIONS,
  },
  {
    id: PaceNavbarItemId.GENERAL,
    name: 'General',
    iconComponent: <UserPen width={16} height={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_GENERAL,
  },
];

export const ACCEPTED_SKILLFILE_TYPES = ['.zip', '.skill'];

export const SKILL_FILE_REQUIREMENTS = [
  '.md file must contain skill name and description formatted in YAML',
  '.zip or .skill file must include a SKILL.md file',
];
