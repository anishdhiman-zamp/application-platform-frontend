export interface AgentDbQueryRequest {
  query: string;
}

export interface AgentDbQueryResponse {
  rows: Record<string, unknown>[];
  count: number;
}

export enum DatasetRoleValue {
  ADMIN = 'admin',
  VIEWER = 'viewer',
  EDITOR = 'editor',
}

export enum RoleAction {
  GRANT = 'grant',
  REVOKE = 'revoke',
}

export interface DatasetRoleEntry {
  user_id: string;
  table_name: string;
  role: DatasetRoleValue;
}

export interface DatasetRolesResponse {
  roles: DatasetRoleEntry[];
}

export interface ManageDatasetRoleRequest {
  table_name: string;
  user_id: string;
  role?: DatasetRoleValue;
  action: RoleAction;
}

export interface AgentDbExportRequest {
  table_name: string;
  where_clause?: string;
}

export interface AgentDbExportResponse {
  workflow_id: string;
}

export interface AgentDbExportStatusResponse {
  workflow_id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  signed_url?: string;
  row_count?: number;
  error_message?: string;
}
