export enum TOAST_MESSAGES {
  SUCCESS_DATASET_SHARED = 'Dataset shared successfully',
  SUCCESS_PAGE_SHARED = 'Page shared successfully',
  SUCCESS_AUDIENCE_ROLE_CHANGED = 'Role changed successfully',
  SUCCESS_AUDIENCE_DELETED = 'Audience deleted successfully',
  SUCCESS_AUDIENCE_INVITED = 'Invitation sent successfully',

  FAILED_DATASET_SHARED = 'Failed to shared dataset',
  FAILED_PAGE_SHARED = 'Failed to share page',
  FAILED_AUDIENCE_ROLE_CHANGED = 'Failed to change role',
  FAILED_AUDIENCE_DELETED = 'Failed to delete audience',
  FAILED_AUDIENCE_INVITED = 'Failed to send invitation',

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
