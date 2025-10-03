// API Response interface
export interface ApiResponse {
  ok: () => boolean;
  status: () => number;
  json: () => Promise<any>;
}

// Widget configuration interface
export interface WidgetConfig {
  type: 'chart' | 'kpi';
  title: string;
  dataset: string;
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
}

// Filter configuration interface
export interface FilterConfig {
  dataset: string;
  column: string;
  operator: string;
  value: string;
}

// Name editing configuration interface
export interface EditNameConfig {
  type: 'page' | 'sheet';
  id: string;
  newName: string;
  location: 'breadcrumb' | 'sidebar' | 'header' | 'tab';
  pageId?: string;
}

// Entity deletion configuration interface
export interface DeleteEntityConfig {
  type: 'page' | 'sheet' | 'widget';
  id: string;
  pageId?: string;
  sheetId?: string;
}
