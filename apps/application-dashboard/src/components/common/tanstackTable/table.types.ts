import { Column, SortDirection, TanStackClientSideRequestProps } from '@zamp-platform/tanstack-table';
import { MapAny } from '@/types/commonTypes';

export type OrderByType = {
  column: string;
  order: SortDirection;
};

export type ColumnType = Column<unknown>;

export interface FormatRequestParams {
  request: TanStackClientSideRequestProps;
  fx_currency?: string;
  useAlias?: boolean;
  ignoreGroupCheck?: boolean;
  disableTotalCount?: boolean;
  hiddenColumnFilters?: MapAny;
  drilldownFilters?: MapAny;
  pageSize?: number;
}
