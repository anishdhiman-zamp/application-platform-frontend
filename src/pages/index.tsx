import React, { ReactElement, useState } from 'react';
import { DATE_FILTER_CATEGORIES, DATE_FILTER_OPTIONS } from 'constants/date.constants';
import { dummyColumns, dummyData } from 'modules/data/data.constants';
import DateRangeFilterWithControl from 'components/common/dateRangePicker/DateRangeFilterWithControl';
import Table from 'components/common/table';
import { DateFilterValueType } from 'components/filter/DateRangeFilter';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Home = () => {

  const dateRangeOptions = DATE_FILTER_OPTIONS.filter((option) => option.value !== DATE_FILTER_CATEGORIES.ALL_TIME);

  const [date, setDate] = useState<DateFilterValueType>({
    date_category: DATE_FILTER_CATEGORIES.CUSTOM_DATE_RANGE,
    start_date: new Date(),
    end_date: new Date(),
  });

  const onDateSelect = (value: DateFilterValueType) => {
    setDate(value);
  };

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
      <Table rows={dummyData} columns={dummyColumns} />
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Home;
