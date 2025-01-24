import { DATASET_ACCESS_PRIVILEGES } from 'modules/data/data.constants';

export type UserAccessToDataSetType = {
  user: {
    name: string;
  };
  previlege: string;
  dataset: string;
}[];

export type ShareDatasetPopupPropsType = {
  isOpen: boolean;
  onClose: () => void;
};

export type DatasetAccessPrivilegesType = {
  label: string;
  value: DATASET_ACCESS_PRIVILEGES;
}