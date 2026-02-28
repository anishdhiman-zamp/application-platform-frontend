import { ReactNode } from 'react';

export const enum PaceNavbarItemId {
  HOME = 'home',
  SKILL = 'skill',
  SETTINGS = 'settings',
  PEOPLE = 'people',
  INTEGRATIONS = 'integrations',
  FILES = 'files',
}

export interface PaceNavbarItemSchema {
  id: PaceNavbarItemId;
  iconComponent: ReactNode;
  path: string;
}

export interface PaceSettingsTabSchema extends PaceNavbarItemSchema {
  name: string;
}

export type DynamicTabType = 'file' | 'task';

export const ROUTE_KIND = {
  QUERY: 'query',
  DYNAMIC: 'dynamic',
} as const;

export type RouteKind = (typeof ROUTE_KIND)[keyof typeof ROUTE_KIND];

export interface QueryRouteConfig {
  kind: typeof ROUTE_KIND.QUERY;
  basePath: string;
  paramName: string;
  fallbackPath: string;
}

export interface DynamicRouteConfig {
  kind: typeof ROUTE_KIND.DYNAMIC;
  basePath: string;
  buildPath: (id: string) => string;
  fallbackPath: string;
}

export type DynamicTabRouteConfig = QueryRouteConfig | DynamicRouteConfig;

export interface DynamicTab {
  stableKey: string;
  id: string;
  name: string;
  path: string;
  type?: DynamicTabType;
  icon?: string;
  metadata?: Record<string, unknown>;
}
