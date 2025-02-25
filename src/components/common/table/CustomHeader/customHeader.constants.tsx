import { IServerSideGetRowsRequest } from 'ag-grid-community';
import { MapAny } from 'types/commonTypes';
import { AggregationFunctionType } from 'types/components/table.type';
import { CustomHeaderMenuOptionTypes } from 'components/common/table/CustomHeader/customHeader.types';
import { getEncodedRequest } from 'components/common/table/table.utils';

export const CustomHeaderMenuOptions = [
  {
    label: 'Rules',
    value: CustomHeaderMenuOptionTypes.RULES,
    iconId: 'lightning-01',
  },
  {
    label: 'Sort Ascending',
    value: CustomHeaderMenuOptionTypes.SORT_ASC,
    iconId: 'arrow-up',
  },
  {
    label: 'Sort Descending',
    value: CustomHeaderMenuOptionTypes.SORT_DESC,
    iconId: 'arrow-down',
  },
  {
    label: 'Remove Sort',
    value: CustomHeaderMenuOptionTypes.REMOVE_SORT,
    iconId: 'x-close',
  },
  {
    label: 'Filter',
    value: CustomHeaderMenuOptionTypes.FILTER,
    iconId: 'filter-lines',
  },
];

const getAggregations = (colId: string): MapAny => {
  return {
    valueCols: [
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionSum.toLowerCase(),
        displayName: AggregationFunctionType.AggregationFunctionSum,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionAvg.toLowerCase(),
        displayName: AggregationFunctionType.AggregationFunctionAvg,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionMin.toLowerCase(),
        displayName: AggregationFunctionType.AggregationFunctionMin,
      },
      {
        id: colId,
        aggFunc: AggregationFunctionType.AggregationFunctionMax.toLowerCase(),
        displayName: AggregationFunctionType.AggregationFunctionMax,
      },
    ],
  };
};

export const getEncodedRequestWithAggregations = (colId: string) =>
  getEncodedRequest(getAggregations(colId) as IServerSideGetRowsRequest, '', [], true, true);
