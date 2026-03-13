import { FC } from 'react';
import ImageKitImage from '@/components/ImageKitImage';
import { DONE_EMPTY_STATE } from '@/constants/icons';
import { EMPTY_STATE_BY_STATUS } from '@/modules/process/process.constant';
import { ACTIVITY_RUN_STATUS } from '@/modules/process/process.types';

interface ProcessEmptyStateProps {
  status?: ACTIVITY_RUN_STATUS;
  title?: string;
  description?: string;
  iconUrl?: string;
}

const ProcessEmptyState: FC<ProcessEmptyStateProps> = ({
  status,
  title = 'Nothing to see here yet',
  description = 'Everything will appear here when available.',
  iconUrl = DONE_EMPTY_STATE,
}) => {
  // Get the empty state data with fallback to avoid runtime errors
  const emptyStateData = EMPTY_STATE_BY_STATUS[status as keyof typeof EMPTY_STATE_BY_STATUS];

  return (
    <div className='animate-opacity flex min-h-[calc(100vh-200px)] w-full flex-col items-center justify-center gap-y-2'>
      <div className='relative flex h-[150px] w-[190px] items-center justify-center'>
        <ImageKitImage
          src={emptyStateData?.iconUrl || iconUrl}
          alt={emptyStateData?.title || title}
          className='h-full w-full object-cover object-center'
          width={190}
          height={150}
        />
      </div>
      <div className='f-14-500 text-GRAY_950 text-center'>{emptyStateData?.title || title}</div>
      <div className='f-13-400 text-GRAY_800 max-w-[260px] text-center text-wrap wrap-break-word'>
        {emptyStateData?.description || description}
      </div>
    </div>
  );
};

export default ProcessEmptyState;
