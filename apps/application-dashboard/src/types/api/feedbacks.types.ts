import { LocationType } from '@zamp-platform/chat';
import { FEEDBACK_STATUS, SCOPE_TYPE } from '@/modules/feedback/feedback.constants';

export interface FeedbackSummary {
  feedback_points: string[];
}

export interface DatasetFieldLocationData {
  process_id: string;
  activity_run_id: string;
  dataset_id: string;
  dataset_row_id: string;
  dataset_field_id: string;
}

export interface LogLocationData {
  process_id: string;
  activity_run_id: string;
  log_id: string;
}

export interface ActivityRunLocationData {
  process_id: string;
  activity_run_id: string;
}

export type LocationData =
  | ({ type: LocationType.DATASET_FIELD } & { data: DatasetFieldLocationData })
  | ({ type: LocationType.LOG } & { data: LogLocationData })
  | ({ type: LocationType.ACTIVITY_RUN } & { data: ActivityRunLocationData });

export interface AnnotationData {
  location: LocationData;
}

export interface FeedbackItemType {
  id: string;
  organization_id: string;
  process_id: string;
  conversation_id: string;
  status: FEEDBACK_STATUS;
  title: string;
  summary: FeedbackSummary;
  created_at: string;
  updated_at: string;
  scope_type: SCOPE_TYPE;
  scope_id: string;
  annotation_data: AnnotationData;
  initiated_by: string;
}

export interface FeedbacksResponseType {
  feedbacks: FeedbackItemType[];
}

export interface ArchiveFeedbackPayloadType {
  process_id: string;
  feedback_ids: string[];
}

export interface StopProcessingFeedbackPayloadType {
  process_id: string;
}
