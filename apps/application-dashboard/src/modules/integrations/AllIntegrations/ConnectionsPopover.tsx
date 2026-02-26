'use client';

import { type FC, useCallback, useState } from 'react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zamp-platform/ui';
import { Link2 } from 'lucide-react';
import { useDeleteIntegrationConnectionMutation } from '@/apis/integrations';
import { useOptionalIntegrationsContext } from '@/modules/integrations/AllIntegrations/Integrations.context';
import type { IntegrationConnection } from '@/types/api/integrations';

interface ConnectionsPopoverProps {
  integrationName: string;
  connections: IntegrationConnection[];
}

const ConnectionsPopover: FC<ConnectionsPopoverProps> = ({ integrationName, connections }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [deleteIntegrationConnection, { isLoading: isDeletingConnection }] = useDeleteIntegrationConnectionMutation();
  const [deletingConnectionId, setDeletingConnectionId] = useState<string | null>(null);
  const integrationsContext = useOptionalIntegrationsContext();

  const handleRemoveClick = useCallback(
    (connectionId: string) => {
      setDeletingConnectionId(connectionId);
      deleteIntegrationConnection({ connectionId })
        .unwrap()
        .then(() => {
          toast.success('Connection removed successfully');
          integrationsContext?.removeConnection(integrationName, connectionId);
        })
        .catch(() => {
          toast.error('Failed to remove connection');
        })
        .finally(() => {
          setDeletingConnectionId(null);
        });
    },
    [deleteIntegrationConnection, integrationsContext, integrationName],
  );

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <TooltipProvider delayDuration={300}>
        <Tooltip open={isPopoverOpen ? false : undefined}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <div className='actions-bar f-12-500 hover:bg-GRAY_100 flex cursor-pointer items-center gap-x-1 rounded-sm px-1 py-0.5'>
                <Link2 size={14} className='-rotate-45' />
                {connections?.length}
              </div>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent side='bottom' align='start'>
            <span className='f-10-450'>
              {connections?.length} {connections?.length === 1 ? 'connection' : 'connections'}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverPortal>
        <PopoverContent
          className='max-h-[300px] w-[250px] overflow-auto p-1'
          align='start'
          avoidCollisions={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div>
            {connections.map((connection) => (
              <div
                key={connection?.id}
                className='text-GRAY_900 hover:bg-GRAY_50 border-b-GRAY_100 flex items-center justify-between gap-x-2 rounded-md px-2 py-1.5 text-sm font-medium last:border-b-0'
              >
                <span className='f-12-500 text-GRAY_900 w-fit flex-1 truncate text-left'>
                  {connection?.name ?? connection?.id}
                </span>
                <Button
                  variant='outline'
                  size='xsmall'
                  isLoading={deletingConnectionId === (connection?.id ?? '') && isDeletingConnection}
                  className='f-11-500 shrink-0 bg-white px-1.5 py-1 hover:bg-white'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClick(connection?.id ?? '');
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default ConnectionsPopover;
