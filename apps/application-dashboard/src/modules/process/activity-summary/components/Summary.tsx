import { memo } from 'react';
import SectionTitle from 'modules/process/activity-summary/components/SectionTitle';
import type { ActivitySummaryItem } from '@/types/api/processApi.types';

interface SummaryProps {
  data: ActivitySummaryItem;
}

const Summary = ({ data }: SummaryProps) => {
  return (
    <div className='flex w-full flex-col items-start justify-start gap-y-3'>
      <SectionTitle title={data?.title} />
      <div className='flex w-full flex-col items-start justify-start gap-y-3'>
        {data?.values?.map(({ key, value }) => (
          <div key={key} className='flex w-full items-start justify-start gap-x-3'>
            <p className='f-12-450 text-GRAY_900 w-[150px] flex-shrink-0 truncate capitalize' title={key}>
              {key}
            </p>
            <p className='f-12-450 text-GRAY_1000 min-w-0 flex-1 px-2 text-wrap break-words' title={value}>
              {value?.toString()?.trim() || '-'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(Summary);
