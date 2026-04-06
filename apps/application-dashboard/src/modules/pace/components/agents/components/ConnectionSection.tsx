'use client';

import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CircleMinus, Play } from 'lucide-react';
import AccessLevelDropdown from 'modules/pace/components/agents/components/AccessLevelDropdown';
import ToolPermissionControl from 'modules/pace/components/agents/components/ToolPermissionControl';
import type { ConnectionSectionPropsType } from 'modules/pace/components/agents/types/agents.types';
import { getNameInitial } from '@/utils/common';

const ConnectionSection = ({
  connection,
  isExpanded,
  integrationLogo,
  integrationName,
  onToggle,
  onPermissionChange,
  onAccessLevelChange,
  onRemoveConnection,
}: ConnectionSectionPropsType) => {
  const [imgError, setImgError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!onRemoveConnection) return;

    setIsRemoving(true);

    try {
      await onRemoveConnection();
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className='flex flex-col gap-0 rounded-lg'>
      <div
        className={cn(
          'hover:bg-GRAY_100 flex items-center gap-2 px-3 py-2 transition-colors',
          isExpanded ? 'bg-GRAY_100 rounded-t-lg' : 'rounded-lg',
        )}
      >
        <div onClick={onToggle} className='flex flex-1 cursor-pointer items-center gap-2'>
          <Play
            size={6}
            className={cn('text-GRAY_700 shrink-0 fill-current transition-transform', isExpanded && 'rotate-90')}
          />
          <div className='bg-GRAY_200 flex size-5 shrink-0 items-center justify-center overflow-hidden rounded'>
            {integrationLogo && !imgError ? (
              <img
                src={integrationLogo}
                alt={integrationName}
                className='h-3.5 w-3.5 object-contain'
                onError={() => setImgError(true)}
              />
            ) : (
              <span className='text-GRAY_700 text-[10px] font-medium'>{getNameInitial(integrationName)}</span>
            )}
          </div>
          <span className='f-12-500 text-GRAY_950'>{connection.email}</span>
          {onRemoveConnection && (
            <Button
              variant='ghost'
              size='icon'
              className='text-GRAY_700 hover:text-GRAY_1000 size-6 shrink-0'
              isLoading={isRemoving}
              onClick={handleRemove}
            >
              <CircleMinus size={14} />
            </Button>
          )}
        </div>
        {onAccessLevelChange && <AccessLevelDropdown value={connection.accessLevel} onChange={onAccessLevelChange} />}
      </div>

      {isExpanded && (
        <div className='bg-GRAY_100 rounded-b-lg'>
          <div className='bg-BG_WHITE border-GRAY_100 flex flex-col rounded-lg border py-1'>
            {connection.tools.map((tool) => (
              <div key={tool.id} className='flex h-[35px] items-center px-3'>
                <span className='f-12-500 text-GRAY_950 flex-1'>{tool.name}</span>
                <ToolPermissionControl
                  permission={tool.permission}
                  onPermissionChange={(perm) => onPermissionChange?.(tool.id, perm)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionSection;
