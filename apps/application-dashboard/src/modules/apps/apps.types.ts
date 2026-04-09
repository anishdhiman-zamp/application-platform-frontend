export interface ServiceSummaryType {
  id: string;
  slug: string | null;
  name: string;
  type: string;
  url: string;
}

export interface AppType {
  id: string;
  slug: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: string;
  visibility: AppVisibility;
  metadata: Record<string, unknown> | null;
  services: ServiceSummaryType[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AppsListResponseType {
  apps: AppType[];
}

export const APP_FILTER_TAB = {
  ALL: 'all',
  MY_APPS: 'my_apps',
} as const;

export type AppFilterTab = (typeof APP_FILTER_TAB)[keyof typeof APP_FILTER_TAB];

export const APP_VISIBILITY = { PUBLIC: 'public' } as const;
export type AppVisibility = (typeof APP_VISIBILITY)[keyof typeof APP_VISIBILITY];
