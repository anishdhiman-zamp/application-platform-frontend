import { ROUTES_PATH } from 'constants/routeConfig';
import { Link2, Settings } from 'lucide-react';
import CoinsStacked04 from '@/assets/Icons/CoinsStacked04';
import Users02 from '@/assets/Icons/Users02';
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
    path: ROUTES_PATH.TEAM,
  },
  {
    id: 'settings',
    label: 'Settings',
    iconComponent: <Settings width={16} height={16} />,
    path: ROUTES_PATH.SETTINGS_TEAM,
  },
];

export const SETTINGS_TABS = [
  {
    id: 'people',
    label: 'People',
    iconComponent: <Users02 width={16} height={16} />,
    path: ROUTES_PATH.SETTINGS_TEAM,
  },
  {
    label: 'Integrations',
    id: 'integrations',
    iconComponent: <Link2 width={16} height={16} className='-rotate-45' />,
    path: ROUTES_PATH.INTEGRATIONS,
  },
];

export const SETTINGS_ID = 'settings';
