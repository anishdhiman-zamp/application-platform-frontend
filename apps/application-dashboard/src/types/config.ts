import type { ReactNode } from 'react';
import { FEATURE_FLAGS } from '@/constants/featureFlags';

export interface NavigationItemSchema {
  label: string;
  id: string;
  iconComponent: ReactNode;
  path: string;
  children?: NavigationItemSchema[];
  isHidden?: boolean;
  featureFlag?: FEATURE_FLAGS;
}
