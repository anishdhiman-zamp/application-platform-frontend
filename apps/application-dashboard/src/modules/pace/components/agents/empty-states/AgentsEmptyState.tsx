import { type FC } from 'react';
import ImageKitImage from '@/components/ImageKitImage';
import { AGENT_EMPTY_STATE } from '@/constants/icons';

interface AgentsEmptyStateProps {
  title?: string;
}

const AgentsEmptyState: FC<AgentsEmptyStateProps> = ({ title = 'No agents found' }) => {
  return (
    <div className='animate-opacity flex h-[calc(100vh-250px)] w-full flex-col items-center justify-center gap-4'>
      <div className='relative flex h-auto w-25 items-center justify-center'>
        <ImageKitImage
          src={AGENT_EMPTY_STATE}
          alt={title}
          className='h-full w-full object-contain'
          width={100}
          height={60}
        />
      </div>
      <div className='f-12-500 text-GRAY_500 text-center'>{title}</div>
    </div>
  );
};

export default AgentsEmptyState;
