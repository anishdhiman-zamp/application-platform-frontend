import type { ComponentType, ReactNode } from 'react';
import type { defaultFnType } from '@/types/commonTypes';

export const enum PaceNavbarItemId {
  HOME = 'home',
  SKILL = 'skill',
  SETTINGS = 'settings',
  PEOPLE = 'people',
  INTEGRATIONS = 'integrations',
  FILES = 'files',
  GENERAL = 'general',
  TASKS = 'task',
}

export interface AnimatedIconHandle {
  startAnimation: defaultFnType;
  stopAnimation: defaultFnType;
}

export interface AnimatedIconProps {
  size?: number;
  className?: string;
}

export interface PaceNavbarItemSchema {
  id: PaceNavbarItemId;
  iconComponent: ComponentType<AnimatedIconProps & { ref?: React.Ref<AnimatedIconHandle> }>;
  path: string;
}

export interface PaceSettingsTabSchema {
  id: PaceNavbarItemId;
  iconComponent: ReactNode;
  name: string;
  heading?: string;
  path: string;
}

export const CHAT_SIDEBAR_STATE = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
  SIDEBAR: 'sidebar',
} as const;

export type ChatSidebarState = (typeof CHAT_SIDEBAR_STATE)[keyof typeof CHAT_SIDEBAR_STATE];

export const TAB_TYPE = {
  FILE: 'file',
  TASK: 'task',
} as const;

export type DynamicTabType = (typeof TAB_TYPE)[keyof typeof TAB_TYPE];

export const ROUTE_KIND = {
  QUERY: 'query',
  DYNAMIC: 'dynamic',
} as const;

export type RouteKind = (typeof ROUTE_KIND)[keyof typeof ROUTE_KIND];

export interface QueryRouteConfig {
  kind: typeof ROUTE_KIND.QUERY;
  basePath: string;
  paramName: string;
}

export interface DynamicRouteConfig {
  kind: typeof ROUTE_KIND.DYNAMIC;
  basePath: string;
  buildPath: (id: string) => string;
}

export type DynamicTabRouteConfig = QueryRouteConfig | DynamicRouteConfig;

export const NAV_METHOD = {
  PUSH: 'push',
  REPLACE: 'replace',
} as const;

export type NavMethod = (typeof NAV_METHOD)[keyof typeof NAV_METHOD];

export interface DynamicTab {
  stableKey: string;
  id: string;
  name: string;
  path: string;
  type?: DynamicTabType;
  icon?: string;
  metadata?: Record<string, unknown>;
}
