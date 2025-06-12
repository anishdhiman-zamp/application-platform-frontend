import Image from 'next/image';
import { EMPTY_STATE_BY_STATUS } from '@/modules/process/process.constant';
import { ACTIVITY_RUN_STATUS } from '@/modules/process/process.types';

const ActivityRunsEmptyState = ({ status }: { status: ACTIVITY_RUN_STATUS }) => {
  const { title, description, iconUrl } = EMPTY_STATE_BY_STATUS[status as keyof typeof EMPTY_STATE_BY_STATUS];

  return (
    <div className='animate-opacity flex min-h-[calc(100vh-200px)] w-full flex-col items-center justify-center gap-y-2'>
      <Image src={iconUrl} alt={title} width={190} height={190} priority objectFit='cover' objectPosition='center' />
      <div className='f-14-500 text-GRAY_950 text-center'>{title}</div>
      <div className='f-13-400 text-GRAY_800 max-w-[260px] text-center text-wrap break-words'>{description}</div>
    </div>
  );
};

export default ActivityRunsEmptyState;
