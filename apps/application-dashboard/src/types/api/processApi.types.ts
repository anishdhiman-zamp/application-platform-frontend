import type { MapAny } from 'types/commonTypes';
import type {
  ARTIFACT_TYPE,
  CTA_ACTION,
  CTA_COMPONENT_TYPE,
  EMAIL_STATUS,
  SENDER_TYPE,
} from '@/modules/process/process.types';

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

export type KnowledgeBaseRequestType = {
  processId: string;
};

export interface KnowledgeBaseResponseType {
  id: string;
  organization_id: string;
  process_id: string;
  description: string;
  version: number;
  storage: {
    provider: string;
    bucket: string;
    path: string;
  };
  metadata: {
    notion_link: string;
  };
  content_signed_url: string;
  effective_from: string; // ISO timestamp
  effective_to: string; // ISO timestamp (could be "0001-01-01T00:00:00Z" as placeholder)
}

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

export type PdfDatasetArtifactsResponseType = {
  display_name: string;
  status: string;
  icon_identifier: string;
  datasets: DatasetType[];
  pdf_file: {
    file_display_name: string;
    file_id: string;
  };
};

export type DatasetArtifactsResponseType = {
  display_name: string;
  status: string;
  icon_identifier: string;
  datasets: DatasetType[];
};

export type PdfArtifactsResponseType = {
  display_name: string;
  status: string;
  icon_identifier: string;
  pdf_file: {
    file_display_name: string;
    file_id: string;
  };
};

export type EmailAttachmentType = {
  file_id: string;
  file_display_name: string;
};

export type BrowserArtifactsResponseType = {
  display_name: string;
  status: string;
  icon_identifier: string;
  browser_url: string;
  browser_session_recording: {
    file_id: string;
    file_display_name: string;
  };
};

export type OtherArtifactsResponseType = {
  display_name: string;
  icon_identifier: string;
  url: string;
};

export type ActivityArtifactsItemType = {
  id: string;
  activity_id: string;
  organization_id: string;
  artifact_type: ARTIFACT_TYPE;
  artifact_data:
    | PdfDatasetArtifactsResponseType
    | PdfArtifactsResponseType
    | DatasetArtifactsResponseType
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
  artifact_type: ARTIFACT_TYPE;
  cta_component_type: CTA_COMPONENT_TYPE;
  cta_action: CTA_ACTION;
  cta_action_id: string;
  hitl_request_id: string;
  cta_value: string;
  cta_config: {
    icon_identifier: string;
    variant: string;
    dataset_to_missing_fields_map: Record<
      string,
      {
        cells: MissingFieldItemType[];
        filters: MapAny;
      }
    >;
    dataset_artifacts: {
      cells: MissingFieldItemType[];
      dataset_id: string;
    }[];
  };
  filter_metadata: MapAny;
};

export type MissingFieldItemType = {
  column: string;
  id: string;
  is_required: boolean;
  confidence?: string;
};

export type LogsContentType = {
  sender_type: SENDER_TYPE;
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
  header: {
    key: string;
    value: string;
  };
  status: string;
  summary_items: ActivitySummaryItem[];
};

export type ActivitySummaryItem = {
  title: string;
  values: {
    key: string;
    value: string;
  }[];
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

export type EmitHITLActionRequestType = {
  processId: string;
  activityRunId: string;
  payload: {
    hitl_request_id: string;
    log_group_id: string;
    submitted_by: string;
    responses: {
      action_id: string;
      values: string[];
      cta_component_type?: CTA_COMPONENT_TYPE;
    }[];
  };
};

export interface EmailUpdatePayloadType {
  heading: string;
  body_html: string;
  to_mail_ids: string[];
  cc_mail_ids: string[];
  bcc_mail_ids: string[];
  attachments: EmailAttachmentType[];
  last_updated_by: {
    id: string;
    name?: string;
  };
}

export interface EmailArtifactsResponseType extends EmailUpdatePayloadType {
  display_name: string;
  status: EMAIL_STATUS;
  icon_identifier: string;
  date: string;
  from_mail_id: string;
  body_plain_text: string;
  from_name: string;
}

export type UpdateArtifactRequestType = {
  processId: string;
  artifactId: string;
  payload: {
    artifact_type: ARTIFACT_TYPE;
    artifact_data: EmailUpdatePayloadType;
  };
};
