import React, { FC, ReactNode, useEffect } from 'react';
import { useGetSheetFilterConfigQuery } from 'apis/pages';
import { getDefaultFilterValues, getFormattedSheetsFiltersConfig } from 'modules/sheets/sheets.utils';
import { FILTER_TYPES } from 'components/filter/filter.types';
import { CONDITION_OPERATOR_TYPE } from 'components/filter/filters.constants';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

const InitializeSheetsFilters: FC<{ children: ReactNode; pageId: string; sheetId: string }> = ({
  children,
  pageId,
  sheetId,
}) => {
  const { dispatch } = useFiltersContextStore();
  const {
    data: sheetFilterConfig,
    isSuccess,
    isFetching,
  } = useGetSheetFilterConfigQuery(
    { pageId: pageId as string, sheetId: sheetId as string },
    { skip: !sheetId, refetchOnMountOrArgChange: false },
  );

  useEffect(() => {
    if (sheetFilterConfig?.native_filter_config?.length) {
      const filtersConfig = sheetFilterConfig?.native_filter_config;
      const defaultFilterValues = getDefaultFilterValues(filtersConfig);

      defaultFilterValues.currency = {
        filterType: FILTER_TYPES.MULTI_SELECT,
        type: CONDITION_OPERATOR_TYPE.IN,
        values: ['USD'],
      };

      const filters = filtersConfig.map((filter) => {
        dispatch({
          type: filtersContextActions.ADD_EMPTY_STATE_FILTER,
          payload: { filterKey: filter.targets?.[0]?.column },
        });

        return getFormattedSheetsFiltersConfig(filter);
      });

      if (filters.length) {
        if (Object.keys(defaultFilterValues).length)
          dispatch({
            type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
            payload: {
              selectedFilters: defaultFilterValues ?? {},
            },
          });

        dispatch({
          type: filtersContextActions.SET_INITIALISED,
        });

        dispatch({
          type: filtersContextActions.SET_FILTERS_CONFIG,
          payload: {
            filtersConfig: filters,
          },
        });
      } else {
        dispatch({
          type: filtersContextActions.SET_INITIALISED,
        });
      }
    } else {
      if (isSuccess)
        dispatch({
          type: filtersContextActions.SET_INITIALISED,
        });
    }
  }, [sheetFilterConfig]);

  useEffect(() => {
    dispatch({
      type: filtersContextActions.SET_FILTER_LOADING,
      payload: { isFilterLoading: isFetching },
    });
  }, [isFetching]);

  return <div>{children}</div>;
};

export default InitializeSheetsFilters;
