import React, { useEffect } from "react";
import { useGetSheetDetailsQuery, useGetSheetFilterConfigQuery } from "apis/pages";
import { COLORS } from "constants/colors";
import { getFormattedSheetsFiltersConfig } from 'modules/sheets/sheets.utils';
import WidgetsWrapper from "modules/widgets/WidgetsWrapper";
import ProgressBar from "components/common/RingProgress";
import FiltersWrapper from "components/filter/filterMenu/FiltersWrapper";
import { filtersContextActions, useFiltersContextStore, withFiltersContext } from "components/filter/filters.context";

interface SheetsProps {
    pageId: string;
    sheetId: string;
}

const Sheets = ({ pageId, sheetId }: SheetsProps) => {
    const {
        dispatch,
        state: { filtersConfig },
    } = useFiltersContextStore();

    const { data: sheetDetails, isLoading: isSheetLoading } = useGetSheetDetailsQuery({ pageId: pageId as string, sheetId: sheetId as string }, { skip: !pageId || !sheetId, refetchOnMountOrArgChange: false });
    const { data: sheetFilterConfig } = useGetSheetFilterConfigQuery({ pageId: pageId as string, sheetId: sheetId as string }, { skip: !sheetId, refetchOnMountOrArgChange: false });

    useEffect(() => {
        if (sheetFilterConfig?.native_filter_config?.length) {
            const filters = sheetFilterConfig?.native_filter_config.map((filter) => {
                dispatch({
                    type: filtersContextActions.ADD_EMPTY_STATE_FILTER,
                    payload: { filterKey: filter.targets[0]?.column },
                });

                return getFormattedSheetsFiltersConfig(filter)
            });

            if (filters.length) {
                dispatch({
                    type: filtersContextActions.SET_FILTERS_CONFIG,
                    payload: {
                        filtersConfig: filters
                    },
                });
            }
        }
    }, [sheetFilterConfig]);

    return (
        <div className='relative'>
            {isSheetLoading && <div className="absolute top-0 right-0 h-[calc(100vh-200px)] w-full flex justify-center items-center z-1000 bg-white">
                <ProgressBar
                    trackColor={COLORS.BLACK}
                    indicatorColor={COLORS.WHITE}
                    indicatorWidth={10}
                    trackWidth={5}
                    className='animate-spin'
                    size={100}
                    progress={30}
                />
            </div>}

            <div className='flex justify-between items-center z-100'>
                <div className='f-24-450 text-GRAY_950 mb-5.5'>{sheetDetails?.name}</div>
                <FiltersWrapper allowClear={false} label='Filter' className='px-0' allowActions={false} filterConfig={filtersConfig ?? []} />
            </div>
            <div className='grid grid-cols-2 gap-5'>
                {sheetDetails &&
                    sheetDetails?.widget_instances?.map((widget) => (
                        <div key={widget?.widget_instance_id}>
                            <WidgetsWrapper key={widget?.widget_instance_id} widgetDetails={widget} />
                        </div>
                    ))}
            </div>
        </div>)
};

export default withFiltersContext(Sheets);