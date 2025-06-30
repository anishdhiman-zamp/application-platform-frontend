import { memo } from 'react';
import SectionTitle from 'modules/process/activity-summary/components/SectionTitle';
import type { ActivitySummaryItem } from '@/types/api/processApi.types';

interface SummaryProps {
  data: ActivitySummaryItem;
}

const Summary = ({ data }: SummaryProps) => {
  return (
    <div className='flex w-full flex-col items-start justify-start'>
      <SectionTitle title={data?.title} />
      <div className='flex w-full flex-col items-start justify-start'>
        {data?.values?.map(({ key, value }) => (
          <div key={key} className='flex w-full items-center justify-start gap-x-3'>
            <p className='f-12-450 text-GRAY_900 w-[150px] truncate capitalize' title={key}>
              {key}
            </p>
            <p className='f-12-450 text-GRAY_1000 max-w-[400px] flex-1 truncate px-2 py-1.5' title={value}>
              {value?.toString()?.trim() || '-'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(Summary);
