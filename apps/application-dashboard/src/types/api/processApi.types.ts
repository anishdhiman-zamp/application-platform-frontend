import type { MapAny } from 'types/commonTypes';
export type StatusSummaryItem = {
  status_summary: {
    status: string;
    count: number;
  }[];
};

export type ProcessActivityRunsRequestType = {
  processId?: string;
  query_config?: string;
};

export type ProcessesResponseType = {
  id: string;
  display_name: string;
  organization_id: string;
  metadata: MetadataType;
  process_type: string;
  fractional_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

type MetadataType = {
  sql_template: string;
  view_name: string;
};

export type ActivityRunsDataResponseType = {
  rows: MapAny[];
  columns: MapAny[];
  config: {
    is_drilldown_enabled: boolean;
  };
  total_count: number;
  description: string;
  title: string;
};
