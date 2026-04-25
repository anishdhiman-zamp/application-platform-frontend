'use client';

import { cn } from '@zamp-platform/ui/utils';
import type { SharedToolPermissionRowPropsType } from '@/modules/integrations/types/integrations.types';
import ToolPermissionControl from '@/modules/pace/components/agents/components/ToolPermissionControl';

const SharedToolPermissionRow = ({ tool, isLast, onPermissionChange }: SharedToolPermissionRowPropsType) => {
  return (
    <div className={cn('flex items-center pr-4', isLast ? 'pt-2 pb-0' : 'py-2')}>
      <span className='f-12-450 text-GRAY_950 flex-1'>{tool.name}</span>
      <ToolPermissionControl
        permission={tool.permission}
        onPermissionChange={(permission) => onPermissionChange(tool.id, permission)}
      />
    </div>
  );
};

export default SharedToolPermissionRow;
