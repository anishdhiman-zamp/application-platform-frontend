'use client';

import { cn } from '@zamp-platform/ui/utils';
import type { ConnectionSharingTabPropsType } from '@/modules/integrations/types/integrations.types';

const ConnectionSharingTab = ({ label, count, isActive, onClick }: ConnectionSharingTabPropsType) => {
  return (
    <div
      role='button'
      onClick={onClick}
      className={cn(
        'f-12-500 flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 transition-colors outline-none focus-visible:outline-none',
        isActive ? 'bg-GRAY_100 text-GRAY_1000' : 'text-GRAY_700 hover:bg-GRAY_50',
      )}
    >
      {label} <span className='text-GRAY_900'>{count}</span>
    </div>
  );
};

export default ConnectionSharingTab;
