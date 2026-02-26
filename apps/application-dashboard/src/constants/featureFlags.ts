import { ENVIRONMENT } from 'constants/common.constants';

export const getClientSideId = (environment: string) => {
  switch (environment) {
    case 'staging':
      return '657145b8cc5a09104bbb584a';
    case 'production':
      return '6569c10a60139c0f61aa5cc2';
    default:
      return '657145d1b551a5101ba31c81';
  }
};

export const LAUNCH_DARKLY_CLIENT_SIDE_ID = getClientSideId(ENVIRONMENT);

export enum FEATURE_FLAGS {
  PEOPLE_MEMBERSHIP_REQUESTS = 'people-membership-requests',
  ADMIN_PAGE = 'admin-page',
  FGAC = 'fgac',
  ENABLE_KNOWLEDGE_BASE = 'enable-knowledge-base',
  SOP_CREATION = 'sop-creation',
  DISABLE_FEEDBACK = 'disable-feedback',
  DASHBOARD_DOWNTIME = 'dashboard-downtime-v2',
  DATASET_CREATION = 'dataset-creation',
  PACE_CHAT = 'pace-chat',
  ZAMP_INTERNAL = 'zamp-internal',
  APP_SECURE = 'app-secure',
  MACS_FILE_SYSTEM = 'macs-file-system',
}
