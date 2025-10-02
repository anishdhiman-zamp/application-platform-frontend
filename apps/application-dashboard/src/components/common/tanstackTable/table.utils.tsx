import { SortDirection, TanStackClientSideRequestProps } from '@zamp-platform/tanstack-table';
import { LOCAL_CURRENCY } from '@/modules/page/pages.constants';
import { AggregationType, GroupByType, OrderByType, OrderType, RequestType } from '@/types/components/table.type';
import { AggregationFunctionMap, PAGE_SIZE } from 'components/common/table/table.constants';
import { getFilterModelFromGroupAndFilterModel } from 'components/common/table/table.utils';
import { FormatRequestParams } from 'components/common/tanstackTable/table.types';

/**
 * Get the group by columns from the request
 * @param request - The request object
 * @returns The group by columns
 */
const getGroupByColumns = (request: TanStackClientSideRequestProps): GroupByType[] => {
  const { rowGroupCols, groupKeys } = request;
  const rowGroupsToBeUsed = groupKeys?.length ? rowGroupCols.slice(groupKeys?.length) : rowGroupCols;

  if (rowGroupsToBeUsed?.length) {
    return [
      {
        column: rowGroupsToBeUsed[0]?.id,
        alias: rowGroupsToBeUsed[0]?.id,
      },
    ];
  }

  return [];
};

/**
 * Get the aggregations from the request
 * @param request - The request object
 * @param useAlias - Whether to use the alias
 * @param ignoreGroupCheck - Whether to ignore the group check
 * @returns The aggregations
 */
const getAggregations = (
  request: TanStackClientSideRequestProps,
  useAlias?: boolean,
  ignoreGroupCheck?: boolean,
): AggregationType[] => {
  const { valueCols, rowGroupCols, groupKeys } = request;

  if (rowGroupCols?.length === groupKeys?.length && !ignoreGroupCheck) {
    return [];
  }

  return (
    valueCols?.map((item) => ({
      column: item?.id,
      alias: useAlias ? (item?.displayName ?? '') : item?.id,
      function: AggregationFunctionMap[item?.aggFunc ?? 'sum'],
    })) || []
  );
};

/**
 * Get the order by columns from the request
 * @param request - The request object
 * @returns The order by columns
 */
const getOrderByColumns = (request: TanStackClientSideRequestProps): OrderByType[] => {
  const { sortModel } = request;

  return (
    sortModel?.map((item) => ({
      column: item.colId,
      order: item.sort === SortDirection.ASC ? OrderType.ASC : OrderType.DESC,
    })) || []
  );
};

/**
 * Format the request
 * @param params - The request parameters object
 * @returns The formatted request
 */
const formatRequest = ({
  request,
  fx_currency,
  useAlias,
  ignoreGroupCheck,
  disableTotalCount,
  hiddenColumnFilters,
  drilldownFilters,
  pageSize,
}: FormatRequestParams): RequestType => {
  const { startRow = 0, endRow } = request;
  const effectivePageSize =
    pageSize ??
    (typeof endRow === 'number' && typeof startRow === 'number' ? Math.max(1, endRow - startRow) : PAGE_SIZE);

  return {
    filters: drilldownFilters ?? getFilterModelFromGroupAndFilterModel(request as any, hiddenColumnFilters),
    aggregations: getAggregations(request, useAlias, ignoreGroupCheck),
    group_by: getGroupByColumns(request),
    order_by: getOrderByColumns(request),
    pagination: {
      page: endRow ? Math.ceil(endRow / effectivePageSize) : 1,
      page_size: effectivePageSize,
    },
    get_total_records: !disableTotalCount,
    fx_currency: !fx_currency || fx_currency === LOCAL_CURRENCY ? undefined : fx_currency,
  };
};

/**
 * Encode the request
 * @param request - The request object
 * @returns The encoded request
 */
export const encodeRequest = (request: RequestType): string => {
  const jsonString = JSON.stringify(request);

  return jsonString;
};

/**
 * Get the encoded request
 * @param params - The request parameters object
 * @returns The encoded request
 */
export const getEncodedRequest = ({
  request,
  fx_currency,
  useAlias,
  ignoreGroupCheck,
  disableTotalCount,
  hiddenColumnFilters,
  drilldownFilters,
  pageSize,
}: FormatRequestParams): string => {
  const formattedRequest = formatRequest({
    request,
    fx_currency,
    useAlias,
    ignoreGroupCheck,
    disableTotalCount,
    hiddenColumnFilters,
    drilldownFilters,
    pageSize,
  });
  const encodedRequest = encodeRequest(formattedRequest);

  return encodedRequest;
};
