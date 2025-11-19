'use client';

import { Activity } from 'lucide-react';
import { cn } from 'utils/common';

interface ProcessNavTabProps {
  label: string;
  processId: string;
  isSelected?: boolean;
}

const ProcessNavTab = ({ label, isSelected }: ProcessNavTabProps) => {
  return (
    <div
      className={cn(
        'text-GRAY_900 f-13-500 hover:bg-GRAY_20 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 select-none',
        isSelected ? 'bg-GRAY_100 text-GRAY_1000' : '',
      )}
    >
      <Activity height={14} width={14} className='cursor-pointer' strokeWidth={1.7} />
      <span className='flex-1'>{label}</span>
    </div>
  );
};

export default ProcessNavTab;
