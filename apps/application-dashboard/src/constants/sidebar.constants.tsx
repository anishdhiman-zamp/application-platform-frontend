import { ROUTES_PATH } from 'constants/routeConfig';
import { Link2 } from 'lucide-react';
import CoinsStacked04 from '@/assets/Icons/CoinsStacked04';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import Users02 from '@/assets/Icons/Users02';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import type { NavigationItemSchema } from '@/types/config';

export const SIDEBAR_ITEMS: NavigationItemSchema[] = [
  {
    id: 'data',
    label: 'Data',
    iconComponent: <CoinsStacked04 width={16} height={16} />,
    path: ROUTES_PATH.DATA,
  },
  {
    id: 'people',
    label: 'People',
    iconComponent: <Users02 width={16} height={16} />,
    path: ROUTES_PATH.PEOPLE,
  },
  {
    id: 'pace',
    label: 'Pace',
    iconComponent: <NewPaceIcons width={16} height={16} />,
    path: ROUTES_PATH.CHAT,
    featureFlag: FEATURE_FLAGS.PACE_CHAT_V2,
  },
];

export const SETTINGS_TABS = [
  {
    id: 'people',
    label: 'People',
    iconComponent: <Users02 width={16} height={16} />,
    path: ROUTES_PATH.SETTINGS_PEOPLE,
  },
  {
    label: 'Integrations',
    id: 'integrations',
    iconComponent: <Link2 width={16} height={16} className='-rotate-45' />,
    path: ROUTES_PATH.INTEGRATIONS,
  },
];

export const SETTINGS_ID = 'settings';
