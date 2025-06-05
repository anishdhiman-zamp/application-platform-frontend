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

export type DatasetType = {
  dataset_id: string;
  dataset_name: string;
};

export type PdfArtifactsResponseType = {
  display_name: string;
  status: string;
  datasets: DatasetType[];
  pdf_file: {
    file_display_name: string;
    file_id: string;
  };
};

export type EmailArtifactsResponseType = {
  display_name: string;
  status: string;
  heading: string;
  date: string;
  from_mail_id: string;
  from_name: string;
  body_html: string;
  body_plain_text: string;
  cc_mail_ids: string[];
  bcc_mail_ids: string[];
  to_mail_ids: string[];
  attachments: {
    file_id: string;
    file_display_name: string;
  }[];
};

export type BrowserArtifactsResponseType = {
  display_name: string;
  status: string;
  browser_url: string;
};

export type OtherArtifactsResponseType = {
  display_name: string;
  url: string;
};

export type ActivityArtifactsItemType = {
  id: string;
  activity_id: string;
  organization_id: string;
  artifact_type: string;
  artifact_data:
    | PdfArtifactsResponseType
    | EmailArtifactsResponseType
    | BrowserArtifactsResponseType
    | OtherArtifactsResponseType;
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
  artifact_type: string;
  cta_component_type: string;
  cta_action: string;
};

export type LogsContentType = {
  sender_type: string;
  sender_details: {
    sender_id: string;
    sender_name: string;
  };
  message: string;
  thought_steps: string[];
  ctas: CtasType[];
};

export type EmitActivityLogsRequestType = {
  processId: string;
  activityRunId: string;
  payload: {
    feedback_message: string;
    sender_id: string;
  };
};

export type ActivitySummaryResponseType = {
  summary: ActivitySummaryItemType;
};

export type ActivitySummaryItemType = {
  header: Record<string, string>;
  status: string;
  summary_items: ActivitySummaryItem[];
};

export type ActivitySummaryItem = {
  title: string;
  values: Record<string, string>;
};

export type ActivityArtifactsByIdRequestType = {
  processId: string;
  activityRunId: string;
  artifact_ids: string;
};

export type ActivityArtifactsByIdResponseType = {
  artifacts: ActivityArtifactsItemType[];
};

export type SignedUrlByArtifactIdRequestType = {
  processId: string;
  artifactId: string;
  fileId: string;
};

export type SignedUrlByArtifactIdResponseType = {
  signed_url: string;
};

export type DatasetArtifactsRequestType = {
  processId: string;
  activityRunId: string;
  datasetId: string;
  query_config?: string;
};
