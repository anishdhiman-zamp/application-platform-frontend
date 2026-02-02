export type TriggerType = 'MANUAL' | 'SCHEDULED' | 'AUTOMATED';

export type TriggerStatus = 'draft' | 'active' | 'disabled' | 'error';

export type TriggerResourceType = 'process';

// Request types
export type CreateTriggerSubscriptionRequestType = {
  integration_name: string;
  connection_id: string;
  trigger_type: TriggerType;
  trigger_name: string;
  resource_type?: TriggerResourceType;
  resource_id: string;
  filters?: Record<string, unknown>;
  status?: TriggerStatus;
  dataset_id?: string;
  schedule_cron?: string;
};

export type GetTriggerSubscriptionRequestType = {
  subscription_id: string;
};

export type GetTriggerSubscriptionsForResourceRequestType = {
  resource_type: TriggerResourceType;
  resource_id: string;
};

export type DeleteTriggerSubscriptionRequestType = {
  subscription_id: string;
};

// Response types
export type TriggerSubscriptionResponseType = {
  id: string;
  organization_id: string;
  integration_name: string;
  connection_id: string;
  partner_trigger_id?: string;
  trigger_type: TriggerType;
  trigger_name: string;
  resource_type: TriggerResourceType;
  resource_id: string;
  filters: Record<string, unknown>;
  dataset_id?: string;
  schedule_cron?: string;
  status: TriggerStatus;
  trigger_count: number;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
};

export type SuccessResponseType = {
  success: boolean;
  message?: string;
};
