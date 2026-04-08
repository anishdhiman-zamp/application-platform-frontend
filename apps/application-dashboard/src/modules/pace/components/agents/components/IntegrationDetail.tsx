'use client';

import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { CircleMinus } from 'lucide-react';
import AddConnectionDropdown from 'modules/pace/components/agents/components/AddConnectionDropdown';
import ConnectionSectionV2 from 'modules/pace/components/agents/components/ConnectionSectionV2';
import type { IntegrationDetailPropsType } from 'modules/pace/components/agents/types/agents.types';
import TooltipV2 from '@/components/common/TooltipV2';
import { getNameInitial } from '@/utils/common';

const IntegrationDetail = ({
  integration,
  allConnections,
  expandedConnections,
  onToggleConnection,
  onRemoveConnection,
  onRemoveIntegration,
  onToggleConnectionEnabled,
}: IntegrationDetailPropsType) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className='flex flex-5 flex-col overflow-hidden p-0.5'>
      <div className='border-GRAY_400 bg-BG_WHITE flex min-h-0 flex-1 flex-col rounded-lg border pt-1.5'>
        <div className='flex shrink-0 items-center gap-4 px-8 pt-4 pb-3'>
          <div className='flex flex-1 items-center gap-1.5'>
            <div className='flex shrink-0 items-center justify-center overflow-clip'>
              {imgError || !integration.logo ? (
                <div className='bg-GRAY_200 text-GRAY_700 f-12-550 flex h-full w-full items-center justify-center rounded'>
                  {getNameInitial(integration.name)}
                </div>
              ) : (
                <img
                  src={integration.logo}
                  alt={integration.name}
                  className='h-4 w-4 object-contain'
                  onError={() => setImgError(true)}
                />
              )}
            </div>
            <span className='f-16-500 text-GRAY_1000'>{integration.name}</span>
          </div>
          <div className='flex items-center gap-2'>
            <AddConnectionDropdown
              integrationIcon={integration.icon}
              integrationLogo={integration.logo}
              integrationName={integration.name}
              connections={integration.connections}
              allConnections={allConnections}
              onToggleConnection={onToggleConnectionEnabled}
            />
            <TooltipV2 tooltipBody='Remove all'>
              <Button
                variant='ghost'
                size='icon'
                className='text-GRAY_700 size-6 shrink-0'
                onClick={() => onRemoveIntegration?.(integration.id)}
              >
                <CircleMinus size={14} />
              </Button>
            </TooltipV2>
          </div>
        </div>

        <div className='flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-8 [scrollbar-width:thin]'>
          {integration.connections.map((connection) => (
            <ConnectionSectionV2
              key={connection.id}
              connection={connection}
              isExpanded={expandedConnections.has(connection.id)}
              integrationLogo={integration.logo}
              integrationName={integration.name}
              onToggle={() => onToggleConnection(connection.id)}
              onRemoveConnection={onRemoveConnection ? () => onRemoveConnection(connection.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationDetail;
