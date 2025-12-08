import { useMemo } from 'react';
import { DATE_FORMATS } from '@zamp-platform/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { DATE_SEPARATOR } from 'modules/process/process.types';
import { DATE_SEPARATOR_MAPPING } from '@/modules/process/process.constant';
import { ensureUTCTimestamp } from '@/utils/common';

interface DateSeparatorProps {
  date: string;
}

const DateSeparator = ({ date }: DateSeparatorProps) => {
  const dateObj = new Date(ensureUTCTimestamp(date));

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
    <div className='flex w-full items-center justify-center gap-x-4 pt-5 pb-6'>
      <div className='bg-GRAY_100 h-px w-full' />
      <span className='f-13-450 text-GRAY_1000 shrink-0 whitespace-nowrap'>{displayText}</span>
      <div className='bg-GRAY_100 h-px w-full' />
    </div>
  );
};

export default DateSeparator;
