import { COLORS } from 'constants/colors';
import { ROUTES_PATH } from 'constants/routeConfig';
import CoinsStacked04 from '@/assets/Icons/CoinsStacked04';
import Users02 from '@/assets/Icons/Users02';
import type { NavigationItemSchema } from '@/types/config';

export const SETTING_SIDEBAR_ITEMS = [
  {
    label: 'People',
    id: 'people',
    iconId: 'users-02',
    path: ROUTES_PATH.TEAM,
  },
  {
    label: 'Policies',
    id: 'policies',
    iconId: 'shield-zap',
    path: ROUTES_PATH.POLICIES,
  },
];
export const SIDEBAR_ITEMS: NavigationItemSchema[] = [
  {
    label: 'Data',
    id: 'data',
    iconComponent: <CoinsStacked04 width={16} height={16} color={COLORS.GRAY_1000} />,
    path: ROUTES_PATH.DATA,
  },
  {
    label: 'People',
    id: 'people',
    iconComponent: <Users02 width={16} height={16} color={COLORS.GRAY_1000} />,
    path: ROUTES_PATH.TEAM,
  },
];
