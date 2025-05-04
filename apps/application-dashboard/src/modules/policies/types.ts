import { DataSource, SelectOption, SelectOptionValue } from '@zamp-platform/form-builder';
import { LOGICAL_OPERATOR_CONDITIONS } from 'modules/widgets/displayConfig/displayConfig.types';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { PolicyDetailsType } from '@/types/api/paymentApi.types';

export enum PolicyQuorum {
  ONE = 'ANY_OF',
  ALL = 'ALL_OF',
}

export type AttributeValue = string | Record<string, string>;

export interface InputConfig {
  type: 'number' | 'text' | 'date' | 'datetime';
  placeholder?: string;
  label?: string;
  suffix_text?: string;
  prefix_text?: string;
  min?: number;
  max?: number;
}

export type FormFieldType = 'condition' | 'creator' | 'input';

export type AttributeType = {
  label: string;
  id: string;
  type: 'input' | 'select' | 'multi-select';
  displayValueFormatter?: (value: number | string) => string;
  operator: '>' | '<' | '==' | 'in' | '!=' | '>=' | '<=';
  formFieldType: FormFieldType;
  validations?: {
    type: 'required';
    config: {
      message: string;
    };
  }[];
  defaultValue?: SelectOptionValue | SelectOptionValue[];
} & (
  | { data_source: DataSource }
  | { options: SelectOption[] }
  | { data_source: DataSource; options: SelectOption[] }
  | { input_config: InputConfig }
);

export interface CreatePolicyConfigPayload {
  creator?: Array<{
    type: string;
    id: string;
  }>;
  conditions: {
    logical_operator: string;
    conditions: Array<{
      field: string;
      value: any;
      operator: string;
    }>;
  };
  action: string;
  approval_flow?: {
    steps: Array<{
      logical_operator: string;
      conditions: Array<{
        mode: string;
        approver_details: Array<{
          type: string;
          id: string;
        }>;
      }>;
    }>;
  };
}

export type PolicyDialogType = 'payout' | 'template';

export interface CreatePolicyDialogProps {
  type: PolicyDialogType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  policyData?: PolicyDetailsType;
}

export type PolicyQuorumOption = {
  label: string;
  value: PolicyQuorum;
};

export type ApproverDetail = {
  type: ResourceAudienceType;
  id: string;
  label?: string;
};

export type ApprovalFlowCondition = {
  mode: PolicyQuorum;
  approver_details: ApproverDetail[];
};

export type ApprovalFlowStep = {
  logical_operator: LOGICAL_OPERATOR_CONDITIONS;
  conditions: ApprovalFlowCondition[];
};

export type ApprovalFlow = {
  steps: ApprovalFlowStep[];
};

export type ApproverListOption = {
  id: string;
  label: string;
  richLabel: JSX.Element;
  displayValue: JSX.Element;
  value: { type: ResourceAudienceType; id: string };
};

export type PolicyFormData = {
  approvalSteps: ApprovalFlowStep[];
  policyName: string;
  [key: string]: SelectOption[] | ApprovalFlowStep[] | string;
};

export enum PolicyActionType {
  CREATE_PAYMENT = 'CREATE_PAYMENT',
  CREATE_TEMPLATE = 'CREATE_TEMPLATE',
}
