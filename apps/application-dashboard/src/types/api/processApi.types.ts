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

export type ActivityArtifactsResponseType = {
  artifacts: ActivityArtifactsItemType[];
};

export type PdfArtifactsResponseType = {
  display_name: string;
  status: string;
  dataset_ids: string[];
  file_name: string;
};

export type EmailArtifactsResponseType = {
  display_name: string;
  status: string;
  heading: string;
  body: string;
  cc_mail_ids: string[];
  bcc_mail_ids: string[];
  to_mail_ids: string[];
  attachments_url: string[];
};

export type BrowserArtifactsResponseType = {
  display_name: string;
  status: string;
  browser_url: string;
};

export type ActivityArtifactsItemType = {
  id: string;
  activity_id: string;
  organization_id: string;
  artifact_type: string;
  artifact_data: PdfArtifactsResponseType | EmailArtifactsResponseType | BrowserArtifactsResponseType;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

export type ActivityArtifactsRequestType = {
  processId: string;
  activityRunId: string;
};

export type ActivityLogsResponseType = {
  activity_logs: ActivityLogsItemType[];
};

export type ActivityLogsItemType = {
  id: string;
  activity_id: string;
  log_group_id: string;
  status: string;
  content_type: string;
  content: LogsContentType;
  metadata: MapAny;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

export type CtasType = {
  id: string;
  display_name: string;
  icon_url: string;
  cta_component_type: string;
  cta_action: string;
};

export type LogsContentType = {
  sender_type: string;
  sender_id: string;
  message: string;
  thought_steps: string[];
  ctas: CtasType[];
};

export type ActivityLogsRequestType = {
  processId: string;
  activityRunId: string;
};

export type EmitActivityLogsRequestType = {
  processId: string;
  activityRunId: string;
  payload: {
    content: LogsContentType;
    log_group_id: string;
    content_type: string;
    status: string;
  };
};
