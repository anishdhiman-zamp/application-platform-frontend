export interface NavigationItemSchema {
  label: string;
  id: string;
  iconId: string;
  path: string;
  children?: NavigationItemSchema[];
  isHidden?: boolean;
}
