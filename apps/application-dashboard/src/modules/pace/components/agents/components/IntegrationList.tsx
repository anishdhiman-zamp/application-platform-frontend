'use client';

import { useState } from 'react';
import { Button, TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CircleMinus, Plus } from 'lucide-react';
import AddConnectionDropdown from 'modules/pace/components/agents/components/AddConnectionDropdown';
import type { AgentIntegrationType, IntegrationListPropsType } from 'modules/pace/components/agents/types/agents.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';
import { getNameInitial } from '@/utils/common';

const IntegrationIcon = ({ logo, name, size = 16 }: { logo?: string; name: string; size?: number }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !logo) {
    return (
      <div className='bg-GRAY_200 text-GRAY_700 f-12-550 flex h-full w-full items-center justify-center rounded'>
        {getNameInitial(name)}
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={name}
      width={size}
      height={size}
      className='h-3.5 w-3.5 object-contain'
      onError={() => setImgError(true)}
    />
  );
};

const getConnectionCount = (integration: AgentIntegrationType) => integration.connections.length;

const ConnectionsTooltipBody = ({ integration }: { integration: AgentIntegrationType }) => (
  <div className='flex max-w-[280px] flex-col gap-0 py-0.5'>
    {integration.connections.map((conn) => (
      <div key={conn.id} className='px-1 py-0.5'>
        <span className='f-12-450 min-w-0 truncate'>{conn.email}</span>
      </div>
    ))}
  </div>
);

const IntegrationList = ({
  integrations,
  selectedIntegrationId,
  onSelectIntegration,
  onRemoveIntegration,
  removingIntegrationId,
  onToggleConnection,
  allIntegrations,
  onAddConnection,
}: IntegrationListPropsType) => (
  <div className='flex flex-2 flex-col justify-between py-1.5'>
    <div className='flex flex-col gap-1 px-1.5'>
      {integrations.map((integration) => {
        const isSelected = selectedIntegrationId === integration.id;
        const isRemoving = removingIntegrationId === integration.id;
        const fullIntegration = allIntegrations?.find((i) => i.id === integration.id);

        return (
          <Button
            variant='ghost'
            key={integration.id}
            onClick={() => onSelectIntegration(integration.id)}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-md border-none p-1.5 hover:bg-none',
              isSelected && 'bg-GRAY_100',
            )}
            disabled={isRemoving}
          >
            <div className='flex min-w-0 flex-1 items-center gap-1.5'>
              <div className='flex size-4 shrink-0 items-center justify-center overflow-clip rounded-[2.5px]'>
                <IntegrationIcon logo={integration.logo} name={integration?.name} size={16} />
              </div>
              <span className='f-14-450 text-GRAY_1000 truncate'>{integration?.name}</span>
            </div>
            <div className='flex shrink-0 items-center gap-0'>
              <TooltipV2
                tooltipBody={<ConnectionsTooltipBody integration={integration} />}
                side={SIDE_OPTIONS.BOTTOM}
                sideOffset={4}
                asChildTrigger
              >
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn('f-12-500 size-6', isSelected ? 'text-GRAY_1000' : 'text-GRAY_700')}
                  onClick={(e) => e.stopPropagation()}
                >
                  {getConnectionCount(integration)}
                </Button>
              </TooltipV2>
              <AddConnectionDropdown
                integrationIcon={integration.icon}
                integrationLogo={integration.logo}
                integrationName={integration?.name}
                connections={integration.connections}
                allConnections={fullIntegration?.connections}
                onToggleConnection={
                  onToggleConnection
                    ? (connId, checked) => onToggleConnection(integration.id, connId, checked)
                    : undefined
                }
              />
              <TooltipV2 tooltipBody='Remove'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-GRAY_700 size-6'
                  isLoading={isRemoving}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveIntegration?.(integration.id);
                  }}
                >
                  <CircleMinus size={14} />
                </Button>
              </TooltipV2>
            </div>
          </Button>
        );
      })}
    </div>

    <div className='px-1.5'>
      <Button
        variant='ghost'
        className='text-GRAY_700 flex h-8 items-center gap-1.5 px-3'
        onClick={(e) => {
          e.stopPropagation();
          onAddConnection?.();
        }}
      >
        <Plus size={14} />
        <span className='f-12-500'>Add connection</span>
      </Button>
    </div>
  </div>
);

export default IntegrationList;
