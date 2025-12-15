export enum TOAST_MESSAGES {
  SUCCESS_DATASET_SHARED = 'Dataset shared successfully',
  SUCCESS_PAGE_SHARED = 'Page shared successfully',
  SUCCESS_PAYMENTS_SHARED = 'Payments access shared successfully',
  SUCCESS_PROCESS_SHARED = 'Process shared successfully',
  SUCCESS_AUDIENCE_ROLE_CHANGED = 'Role changed successfully',
  SUCCESS_AUDIENCE_DELETED = 'Audience deleted successfully',
  SUCCESS_AUDIENCE_INVITED = 'Invitation mail sent',
  SUCCESS_AUDIENCE_CUSTOMISE_ACCESS = 'Custom access filters updated successfully',

  FAILED_DATASET_SHARED = 'Failed to shared dataset',
  FAILED_PAGE_SHARED = 'Failed to share page',
  FAILED_PAYMENTS_SHARED = 'Failed to share payments access',
  FAILED_PROCESS_SHARED = 'Failed to share process',
  FAILED_AUDIENCE_ROLE_CHANGED = 'Failed to change role',
  FAILED_AUDIENCE_DELETED = 'Failed to delete audience',
  FAILED_AUDIENCE_INVITED = 'Failed to send invitation',
  FAILED_AUDIENCE_CUSTOMISE_ACCESS = 'Failed to update custom access filters',

  SUCCESS_APPROVED = 'Approved',
  SUCCESS_REJECTED = 'Rejected',

  ERROR_APPROVED = 'Failed to approve',
  ERROR_REJECTED = 'Failed to reject',

  SUCCESS_TAGGING_COMPLETED = 'Tagging completed successfully',
  ERROR_TAGGING = 'Tagging failed',
  IN_PROGRESS_TAGGING = 'Tagging in progress',

  SUCCESS_DATASET_CREATED = 'Dataset created successfully',
  ERROR_DATASET_CREATION_FAILED = 'Dataset creation failed',

  SUCCESS_TRANSFORMATION_CREATED = 'Transformation created successfully',
  ERROR_TRANSFORMATION_CREATION_FAILED = 'Transformation creation failed',

  SUCCESS_RULE_DELETION = 'Rule deleted successfully',
  ERROR_RULE_DELETION = 'Rule deletion failed',
  IN_PROGRESS_RULE_DELETION = 'Rule deletion in progress',

  ERROR_FETCHING_POLICIES = 'Error fetching policies',
  ERROR_DELETING_POLICY = 'Failed to delete policy',
  SUCCESS_POLICY_DELETED = 'Policy deleted successfully',
  FAILED_DATASET_UPDATE = 'Dataset update failed',

  SUCCESS_TEMPLATE_UPDATED = 'Template updated successfully',
  ERROR_TEMPLATE_UPDATED = 'Template update failed',
  ERROR_TEMPLATE_FETCH = 'Template fetch failed',

  ERROR_RULE_PRIORITY_UPDATE = 'Rule priority update failed',
  ERROR_FETCHING_ACCOUNTS = 'Failed to fetch accounts',

  ERROR_RECIPIENT_CREATION = 'Failed to create recipient',
  ERROR_RECIPIENT_ACCOUNT_CREATION = 'Failed to create recipient account',
  ERROR_RECIPIENT_ACCOUNT_UPDATE = 'Failed to update recipient account',

  SUCCESS_RECIPIENT_CREATION = 'Recipient created successfully',
  SUCCESS_RECIPIENT_ACCOUNT_CREATION = 'Recipient account created successfully',
  SUCCESS_RECIPIENT_ACCOUNT_UPDATE = 'Recipient account updated successfully',

  LOADING_RECIPIENT_CREATION = 'Recipient creation in progress',
  LOADING_RECIPIENT_ACCOUNT_CREATION = 'Recipient account creation in progress',
  LOADING_RECIPIENT_ACCOUNT_UPDATE = 'Recipient account update in progress',

  ERROR_POLICY_CREATION = 'Failed to create policy',
  ERROR_POLICY_UPDATE = 'Failed to update policy',

  SUCCESS_POLICY_CREATION = 'Policy created successfully',
  SUCCESS_POLICY_UPDATE = 'Policy updated successfully',

  LOADING_POLICY_CREATION = 'Policy creation in progress',
  LOADING_POLICY_UPDATE = 'Policy update in progress',

  SUCCESS_UPDATE_MISSING_FIELD = 'Missing field updated successfully',
  ERROR_UPDATE_MISSING_FIELD = 'Missing field update failed',
  IN_PROGRESS_UPDATE_MISSING_FIELD = 'Missing field update in progress',

  SUCCESS_TEAM_NAME_UPDATED = 'Team name updated successfully',
  ERROR_TEAM_NAME_UPDATE = 'Failed to update team name',

  SUCCESS_PAGE_NAME_UPDATED = 'Page title updated successfully',
  ERROR_PAGE_NAME_UPDATE = 'Failed to update page title',

  SUCCESS_SHEET_NAME_UPDATED = 'Sheet name updated successfully',
  ERROR_SHEET_NAME_UPDATE = 'Failed to update sheet name',

  SUCCESS_SHEET_CREATED = 'Sheet created successfully',
  ERROR_SHEET_CREATION_FAILED = 'Failed to create sheet',
}

export const TaggingMessages = {
  SUCCESS: TOAST_MESSAGES.SUCCESS_TAGGING_COMPLETED,
  ERROR: TOAST_MESSAGES.ERROR_TAGGING,
  IN_PROGRESS: TOAST_MESSAGES.IN_PROGRESS_TAGGING,
};

export const RuleDeletionMessages = {
  SUCCESS: TOAST_MESSAGES.SUCCESS_RULE_DELETION,
  ERROR: TOAST_MESSAGES.ERROR_RULE_DELETION,
  IN_PROGRESS: TOAST_MESSAGES.IN_PROGRESS_RULE_DELETION,
};

export const UpdateMissingFieldsMessages = {
  SUCCESS: TOAST_MESSAGES.SUCCESS_UPDATE_MISSING_FIELD,
  ERROR: TOAST_MESSAGES.ERROR_UPDATE_MISSING_FIELD,
  IN_PROGRESS: TOAST_MESSAGES.IN_PROGRESS_UPDATE_MISSING_FIELD,
};

export const KB_TOAST_MESSAGES = {
  FAILED_CONVERSATION_CREATION: 'Failed to create conversation',
  FAILED_FETCHING_KNOWLEDGE_BASE: 'Failed to fetch knowledge base content',
};
