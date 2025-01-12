import React, { useEffect, useState } from 'react';
import { useGetDatasetDataQuery, useGetDatasetFilterConfigQuery } from 'apis/dataset';
import { DATE_FILTER_CATEGORIES, DATE_FILTER_OPTIONS } from 'constants/date.constants';
import { DatasetFilterConfigResponseType } from 'types/api/dataset.types';
import DateRangeFilterWithControl from 'components/common/dateRangePicker/DateRangeFilterWithControl';
import Table from 'components/common/table';
import { DateFilterValueType } from 'components/filter/DateRangeFilter';
import { AG_GRID_FILTER_TYPES } from 'components/filter/filters.constants';
import { withFiltersContext } from 'components/filter/filters.context';


const DataHome = () => {

    const { data: filterConfig } = useGetDatasetFilterConfigQuery({ datasetId: 'b21fe5bf_8f4c_4b12_ba5d_20c2d8de8968' });
    const { data: datasetData } = useGetDatasetDataQuery({ datasetId: 'b21fe5bf_8f4c_4b12_ba5d_20c2d8de8968' });
    const [columns, setColumns] = useState<any[]>([]);

    const dateRangeOptions = DATE_FILTER_OPTIONS.filter((option) => option.value !== DATE_FILTER_CATEGORIES.ALL_TIME);

    const [date, setDate] = useState<DateFilterValueType>({
        date_category: DATE_FILTER_CATEGORIES.CUSTOM_DATE_RANGE,
        start_date: new Date(),
        end_date: new Date(),
    });

    const onDateSelect = (value: DateFilterValueType) => {
        setDate(value);
    };

    useEffect(() => {
        if (filterConfig?.length) {
            const columns = filterConfig?.map((column: DatasetFilterConfigResponseType) => ({
                field: column.column,
                filter: AG_GRID_FILTER_TYPES[column.type as keyof typeof AG_GRID_FILTER_TYPES] ?? '',
                filterParams: {
                    values: column.options
                },
                flex: 1
            }));

            if (columns.length > 0) {
                setColumns(columns);
            }
        }
    }, [filterConfig]);

    return (
        <div className='h-full'>
            <div className='flex items-center justify-end px-5'>
                <DateRangeFilterWithControl
                    onChange={onDateSelect}
                    value={date}
                    disabled={false}
                    className='tw-mr-6'
                    customRangeOptions={dateRangeOptions}
                    disableFutureDate

                />
            </div>
            <Table rows={datasetData?.rows ?? []} columns={columns} />
        </div>
    );;
};

export default withFiltersContext(DataHome);
