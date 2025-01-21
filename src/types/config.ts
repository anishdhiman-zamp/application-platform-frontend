import { ICON_SPRITE_TYPES } from "constants/icons";

export interface NavigationItemSchema {
    label: string;
    iconId: string;
    iconCategory: ICON_SPRITE_TYPES;
    path: string;
    children?: NavigationItemSchema[];
}