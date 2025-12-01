import { ROUTES_PATH } from 'constants/routeConfig';
import CoinsStacked04 from '@/assets/Icons/CoinsStacked04';
import Users02 from '@/assets/Icons/Users02';
import type { NavigationItemSchema } from '@/types/config';

export const SIDEBAR_ITEMS: NavigationItemSchema[] = [
  {
    label: 'Data',
    id: 'data',
    iconComponent: <CoinsStacked04 width={16} height={16} />,
    path: ROUTES_PATH.DATA,
  },
  {
    label: 'People',
    id: 'people',
    iconComponent: <Users02 width={16} height={16} />,
    path: ROUTES_PATH.TEAM,
  },
];
