import type { ReactNode } from 'react';

export interface NavigationItemSchema {
  label: string;
  id: string;
  iconComponent: ReactNode;
  path: string;
  children?: NavigationItemSchema[];
  isHidden?: boolean;
}
