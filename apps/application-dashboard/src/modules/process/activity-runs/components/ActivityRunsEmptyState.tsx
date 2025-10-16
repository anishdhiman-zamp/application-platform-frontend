import { DONE_EMPTY_STATE } from '@/constants/icons';
import { EMPTY_STATE_BY_STATUS } from '@/modules/process/process.constant';
import { ACTIVITY_RUN_STATUS } from '@/modules/process/process.types';

const ActivityRunsEmptyState = ({ status }: { status: ACTIVITY_RUN_STATUS }) => {
  // Get the empty state data with fallback to avoid runtime errors
  const emptyStateData = EMPTY_STATE_BY_STATUS[status as keyof typeof EMPTY_STATE_BY_STATUS];

  // Fallback if status is not found in the constant object
  const { title, description, iconUrl } = emptyStateData || {
    title: 'Nothing to see here yet',
    description: 'Everything will appear here when available.',
    iconUrl: DONE_EMPTY_STATE,
  };

  return (
    <div className='animate-opacity flex min-h-[calc(100vh-200px)] w-full flex-col items-center justify-center gap-y-2'>
      <div className='relative flex h-[150px] w-[190px] items-center justify-center'>
        <img src={iconUrl} alt={title} className='h-full w-full object-cover object-center' />
      </div>
      <div className='f-14-500 text-GRAY_950 text-center'>{title}</div>
      <div className='f-13-400 text-GRAY_800 max-w-[260px] text-center text-wrap break-words'>{description}</div>
    </div>
  );
};

export default ActivityRunsEmptyState;
