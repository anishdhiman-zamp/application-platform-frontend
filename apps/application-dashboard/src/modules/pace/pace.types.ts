import type { ReactNode } from 'react';

export const enum PaceNavbarItemId {
  HOME = 'home',
  SKILL = 'skill',
  SETTINGS = 'settings',
  PEOPLE = 'people',
  INTEGRATIONS = 'integrations',
  FILES = 'files',
  GENERAL = 'general',
  DATASETS = 'datasets',
  TASKS = 'task',
  APPS = 'apps',
  AGENTS = 'agents',
  ORG_SETTINGS = 'org-settings',
  CREDENTIALS_VAULT = 'credentials-vault',
  DESIGN_SYSTEM = 'design-system',
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
  AGENT: 'agent',
  BROWSER: 'browser',
  DATASET: 'dataset',
} as const;

export type DynamicTabType = (typeof TAB_TYPE)[keyof typeof TAB_TYPE];

export const TAB_QUERY_PARAM = {
  FILE: 'f',
  TASK: 't',
  AGENT: 'a',
  BROWSER: 'b',
  DATASET: 'd',
} as const;

export type TabQueryParam = (typeof TAB_QUERY_PARAM)[keyof typeof TAB_QUERY_PARAM];

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

export interface BrowserViewerStateConfig {
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  showRetry?: boolean;
}

export interface DynamicTab {
  stableKey: string;
  id: string;
  name: string;
  path: string;
  type?: DynamicTabType;
  icon?: string;
  metadata?: Record<string, unknown>;
}
