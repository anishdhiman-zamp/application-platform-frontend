import SectionTitle from 'modules/process/activity-summary/components/SectionTitle';
import type { ActivitySummaryItem } from '@/types/api/processApi.types';

interface SummaryProps {
  data: ActivitySummaryItem;
}

const Summary = ({ data }: SummaryProps) => {
  return (
    <div className='flex flex-col items-start justify-start w-full'>
      <SectionTitle title={data?.title} />
      <div className='flex flex-col items-start justify-start w-full'>
        {Object.entries(data?.values).map(([key, value]) => (
          <div key={key} className='grid grid-cols-[1fr_1fr] items-center w-full gap-x-3'>
            <p className='f-12-450 text-GRAY_900 truncate max-w-full capitalize' title={key}>
              {key}
            </p>
            <p className='f-12-450 text-GRAY_1000 py-1.5 px-2 truncate w-full' title={value}>
              {value ?? '-'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
