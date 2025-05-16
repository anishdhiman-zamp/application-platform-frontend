import { useMemo } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { DATE_SEPARATOR } from 'modules/process/process.types';
import { DATE_FORMATS } from '@/constants/date.constants';
import { DATE_SEPARATOR_MAPPING } from '@/modules/process/process.constant';

interface DateSeparatorProps {
  date: string;
}

const DateSeparator = ({ date }: DateSeparatorProps) => {
  const dateObj = new Date(date);

  const displayText = useMemo(() => {
    if (isToday(dateObj)) {
      return DATE_SEPARATOR_MAPPING[DATE_SEPARATOR.TODAY];
    } else if (isYesterday(dateObj)) {
      return DATE_SEPARATOR_MAPPING[DATE_SEPARATOR.YESTERDAY];
    } else {
      return format(dateObj, DATE_FORMATS.d_MMM_yyyy);
    }
  }, [dateObj]);

  return (
    <div className='min-w-max flex justify-center items-center gap-x-4 pt-5 pb-6'>
      <div className='w-full h-px bg-GRAY_100' />
      <span className='f-13-450 text-GRAY_1000 whitespace-nowrap'>{displayText}</span>
      <div className='w-full h-px bg-GRAY_100' />
    </div>
  );
};

export default DateSeparator;
