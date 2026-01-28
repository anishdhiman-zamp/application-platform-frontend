import { BookTextIcon, HomeIcon, SettingsIcon, ShapesIcon } from '@zamp-platform/ui';
import { FileText, Link2, LucideIcon, Table2 } from 'lucide-react';
import { DynamicTabType, PaceNavbarItemId, PaceNavbarItemSchema, PaceSettingsTabSchema } from 'modules/pace/pace.types';
import Users02 from '@/assets/Icons/Users02';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { INPUT_FILE_FORMATS } from '@/types/common/mime';

/**
 * Icon map for dynamic tabs based on their type.
 * Add new entries here when extending DynamicTabType.
 */
export const DYNAMIC_TAB_ICON_MAP: Record<DynamicTabType, LucideIcon> = {
  [DynamicTabType.PAGE]: FileText,
  [DynamicTabType.DATASET]: Table2,
};

export const ACCEPTED_FILE_TYPES = `${INPUT_FILE_FORMATS.TXT},${INPUT_FILE_FORMATS.PDF},${INPUT_FILE_FORMATS.DOCX},${INPUT_FILE_FORMATS.JPEG},${INPUT_FILE_FORMATS.JPG},${INPUT_FILE_FORMATS.PNG},${INPUT_FILE_FORMATS.BMP}`;

export const DEFAULT_CHAT_TITLE = 'Untitled';
export const DEBOUNCE_DELAY_MS = 300;
export const NEW_CONVERSATION_ID = 'null_thread';
export const SIDEBAR_WIDTH = 400;
export const SIDEBAR_CONVERSATION_ID_PARAM = 's';
export const CHAT_CONVERSATION_ID_PARAM = 'c';

export const PACE_NAVBAR_ITEMS: PaceNavbarItemSchema[] = [
  {
    id: PaceNavbarItemId.HOME,
    iconComponent: <HomeIcon size={16} />,
    path: ROUTES_PATH.CHAT,
  },
  {
    id: PaceNavbarItemId.SKILL,
    iconComponent: <BookTextIcon size={16} />,
    path: ROUTES_PATH.CHAT_SKILLS,
  },
  {
    id: PaceNavbarItemId.SETTINGS,
    iconComponent: <SettingsIcon size={16} />,
    path: ROUTES_PATH.CHAT_SETTINGS_PEOPLE,
  },
  {
    id: PaceNavbarItemId.ARTIFACTS,
    iconComponent: <ShapesIcon size={16} />,
    path: ROUTES_PATH.CHAT_ARTIFACTS,
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
];
