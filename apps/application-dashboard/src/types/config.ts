export interface NavigationItemSchema {
  label: string;
  id: string;
  iconUrl: string;
  path: string;
  children?: NavigationItemSchema[];
  isHidden?: boolean;
}
