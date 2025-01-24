import React from "react";
import { useGetSheetDetailsQuery } from "apis/pages";
import { COLORS } from "constants/colors";
import InitializeSheetsFilters from 'modules/sheets/InitializeSheetsFilters';
import WidgetsWrapper from "modules/widgets/WidgetsWrapper";
import ProgressBar from "components/common/RingProgress";
import FiltersWrapper from "components/filter/filterMenu/FiltersWrapper";
import { useFiltersContextStore, withFiltersContext } from "components/filter/filters.context";

interface SheetsProps {
    pageId: string;
    sheetId: string;
}

const Sheets = ({ pageId, sheetId }: SheetsProps) => {
    const { state: { filtersConfig } } = useFiltersContextStore();
    const { data: sheetDetails, isLoading: isSheetLoading } = useGetSheetDetailsQuery({ pageId: pageId as string, sheetId: sheetId as string }, { skip: !pageId || !sheetId, refetchOnMountOrArgChange: false });

    return (
        <InitializeSheetsFilters pageId={pageId} sheetId={sheetId}>
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
            </div>
        </InitializeSheetsFilters>
    )
};

export default withFiltersContext(Sheets);