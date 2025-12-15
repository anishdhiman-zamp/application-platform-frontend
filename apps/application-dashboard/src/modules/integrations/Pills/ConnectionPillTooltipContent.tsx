import type { FC } from 'react';

interface ConnectionPillTooltipContentProps {
  title: string;
}

const ConnectionPillTooltipContent: FC<ConnectionPillTooltipContentProps> = ({ title }) => {
  return (
    <div className='flex flex-col gap-y-1.5'>
      <span className='f-10-450 text-pre-wrap text-white'>{title}</span>
      <span className='f-10-450 text-GRAY_700'>Click to take action</span>
    </div>
  );
};

export default ConnectionPillTooltipContent;
