import React, { FC, ReactNode, useEffect } from "react";
import { useGetSheetFilterConfigQuery } from "apis/pages";
import { getDefaultFilterValues, getFormattedSheetsFiltersConfig } from 'modules/sheets/sheets.utils';
import { filtersContextActions, useFiltersContextStore } from "components/filter/filters.context";

const InitializeSheetsFilters: FC<{ children: ReactNode, pageId: string, sheetId: string }> = ({ children, pageId, sheetId }) => {
    const { dispatch } = useFiltersContextStore();
    const { data: sheetFilterConfig } = useGetSheetFilterConfigQuery({ pageId: pageId as string, sheetId: sheetId as string }, { skip: !sheetId, refetchOnMountOrArgChange: false });

    useEffect(() => {
        if (sheetFilterConfig?.native_filter_config?.length) {
            const filtersConfig = sheetFilterConfig?.native_filter_config
            const defaultFilterValues = getDefaultFilterValues(filtersConfig)

            const filters = filtersConfig.map((filter) => {
                dispatch({
                    type: filtersContextActions.ADD_EMPTY_STATE_FILTER,
                    payload: { filterKey: filter.targets[0]?.column },
                });

                return getFormattedSheetsFiltersConfig(filter)
            });

            if (filters.length) {
                if (Object.keys(defaultFilterValues).length)
                    dispatch({
                        type: filtersContextActions.INITIALIZE_DEFAULT_FILTERS,
                        payload: {
                            selectedFilters: defaultFilterValues
                        },
                    })

                dispatch({
                    type: filtersContextActions.SET_FILTERS_CONFIG,
                    payload: {
                        filtersConfig: filters
                    },
                });

                dispatch({
                    type: filtersContextActions.SET_INITIALISED,
                });
            }
        }
    }, [sheetFilterConfig]);

    return <div>{children}</div>
}

export default InitializeSheetsFilters