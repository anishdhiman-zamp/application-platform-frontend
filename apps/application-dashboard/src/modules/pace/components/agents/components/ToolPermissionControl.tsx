'use client';

import { Button } from '@zamp-platform/ui';
import { PERMISSION_OPTIONS } from 'modules/pace/components/agents/constants/agents.constants';
import type { ToolPermissionControlPropsType } from 'modules/pace/components/agents/types/agents.types';

const ToolPermissionControl = ({ permission, onPermissionChange }: ToolPermissionControlPropsType) => (
  <div className='bg-GRAY_100 flex h-6 shrink-0 items-start gap-1 rounded'>
    {PERMISSION_OPTIONS.map((option) => {
      const Icon = option.icon;
      const isActive = permission === option?.value;

      return (
        <Button
          key={option.value}
          variant='ghost'
          size='icon'
          onClick={() => onPermissionChange(option?.value)}
          className={`flex h-6 w-6 cursor-pointer items-center justify-center overflow-clip rounded p-1.5 ${
            isActive ? 'border-GRAY_400 bg-BG_WHITE border' : ''
          }`}
          title={option.label}
        >
          <Icon size={14} className={isActive ? 'text-GRAY_1000' : 'text-GRAY_700'} />
        </Button>
      );
    })}
  </div>
);

export default ToolPermissionControl;
