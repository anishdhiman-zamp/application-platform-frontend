import React, { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { CircleMinus } from 'lucide-react';
import { ConnectionSectionPropsType } from 'modules/pace/components/agents/types/agents.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { getNameInitial } from '@/utils/common';

const ConnectionSectionV2 = ({
  connection,
  integrationLogo,
  integrationName,
  onToggle,
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
      <div className='flex items-center gap-2 py-2 pl-3 transition-colors'>
        <div onClick={onToggle} className='flex flex-1 cursor-pointer items-center justify-between gap-2'>
          <div className='flex items-center justify-center gap-2'>
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
          </div>

          {onRemoveConnection && (
            <TooltipV2 tooltipBody='Remove access'>
              <Button
                variant='ghost'
                size='icon'
                className='text-GRAY_700 hover:text-GRAY_1000 size-6 shrink-0'
                isLoading={isRemoving}
                onClick={handleRemove}
              >
                <CircleMinus size={14} />
              </Button>
            </TooltipV2>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionSectionV2;
