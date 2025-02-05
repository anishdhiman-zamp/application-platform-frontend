export enum DATASET_ACCESS_PRIVILEGES {
  ADMIN = 'admin',
  DATA_READER = 'data_reader',
}

export type UserAccessToDataSetType = {
  name: string;
  privilege: string;
  resource_type: string;
}[];

export type ShareDatasetPopupPropsType = {
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

export type DatasetAccessToAudiencesPropsType = {
  name?: string;
  resource_type: string;
  privilege?: string;
  datasetId: string;
  resource_audience_id: string;
  resource_audience_type: string;
  user?: {
    email: string;
    name?: string;
  };
  userPrivilege: string;
};
