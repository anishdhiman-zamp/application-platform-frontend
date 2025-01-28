export enum DATASET_ACCESS_PRIVILEGES {
  VIEWER = 'viewer',
  ADMIN = 'admin',
}

export type UserAccessToDataSetType = {
  name: string;
  privilege: string;
  resource_type: string;
}[];

export type ShareDatasetPopupPropsType = {
  isOpen: boolean;
  onClose: () => void;
  datasetId: string;
};

export type DatasetAccessPrivilegesType = {
  label: string;
  value: DATASET_ACCESS_PRIVILEGES;
};

export enum DATASET_ACTION_STATUS {
  INITIATED = 'INITIATED',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
}

export type DatasetAccesToAudiencesPropsType = {
  name?: string;
  resource_type: string;
  privilege?: string;
};
