import { FC, memo } from 'react';
import { ProcessStatus as ProcessStatusEnum } from '@/types/api/processApi.types';
import { cn } from '@/utils/common';

interface ProcessStatusProps {
  status?: ProcessStatusEnum;
  className?: string;
}
const ProcessStatus: FC<ProcessStatusProps> = ({ status, className }) => {
  if (!status) return null;

  return (
    <div className={cn('flex items-center rounded-full border border-gray-100 bg-white px-2 py-1', className)}>
      <span className='f-10-550 text-gray-900 uppercase'>{status}</span>
    </div>
  );
};

export default memo(ProcessStatus);
