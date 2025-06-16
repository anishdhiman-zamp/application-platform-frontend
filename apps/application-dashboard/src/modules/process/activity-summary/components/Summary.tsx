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
        {Object.entries(data?.values).map(([key, value]) => (
          <div key={key} className='grid w-full grid-cols-[1fr_1fr] items-center gap-x-3'>
            <p className='f-12-450 text-GRAY_900 max-w-full truncate capitalize' title={key}>
              {key}
            </p>
            <p className='f-12-450 text-GRAY_1000 w-full truncate px-2 py-1.5' title={value}>
              {value?.toString()?.trim() || '-'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
