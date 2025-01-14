import React from "react";
import { DATE_FILTER_CATEGORIES } from "constants/date.constants";
import DateRangeFilter, { DateFilterValueType } from 'components/filter/DateRangeFilter';
import { filtersContextActions, useFiltersContextStore } from 'components/filter/filters.context';

const DateRangeFilterMenuItem = ({ column }: { column: any }) => {
    const { state, dispatch } = useFiltersContextStore();
    const columnId = column?.colId;

    const onChange = (value: DateFilterValueType) => {
        dispatch({
            type: filtersContextActions.SET_SELECTED_FILTERS, payload: {
                selectedFilters: {
                    [columnId]: {
                        "dateFrom": value?.start_date?.toISOString(),
                        "dateTo": value?.end_date?.toISOString(),
                        "filterType": "date",
                        "type": "inRange"
                    }
                }
            }
        });
    }

    return (
        <div>
            <DateRangeFilter
                onChange={onChange}
                value={{
                    date_category: DATE_FILTER_CATEGORIES.CUSTOM_DATE_RANGE,
                    start_date: new Date(state.selectedFilters[columnId]?.dateFrom ?? new Date()),
                    end_date: new Date(state.selectedFilters[columnId]?.dateTo ?? new Date()),
                }}
                disabled={false}
                controlClassName='px-2 py-1.5 border-DIVIDER_SAIL_2 rounded-lg h-auto mr-3 cursor-pointer'
                isSingle={false}
                disableFutureDate={false}
            />
        </div>
    )
}

export default DateRangeFilterMenuItem;