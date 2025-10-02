import { RefObject } from 'react';
import { SortDirection } from '@zamp-platform/tanstack-table';
import { FILTER_TYPES } from '@/components/filter/filter.types';
import { RuleColumnDetailsType } from '@/modules/data/data.types';
import { DatasetFilterConfigMetadataType, DatasetUpdateResponseType } from '@/types/api/dataset.types';
import { defaultFnType, MapAny } from '@/types/commonTypes';

export interface CustomHeaderProps {
  metadata: DatasetFilterConfigMetadataType;
  handleRulesListingSideDrawerOpen: (ruleColumnDetailsValue: RuleColumnDetailsType) => void;
  handleSuccessfulUpdate: (data: DatasetUpdateResponseType) => void;
  datasetId: string;
  tableRef: RefObject<HTMLTableElement>;
  filterType: FILTER_TYPES;
  options: string[];
  columnId: string;
  headerLabel?: string;
  onSortAsc?: defaultFnType;
  onSortDesc?: defaultFnType;
  onClearSort?: defaultFnType;
  getIsSorted?: () => false | SortDirection;
  onHideColumn?: defaultFnType;
  filterComponentProps?: MapAny;
  className?: string;
  headerBackgroundNeeded?: boolean;
  hideFloatingFilter?: boolean;
  dateFormat?: string;
  isSelfServe?: boolean;
}
