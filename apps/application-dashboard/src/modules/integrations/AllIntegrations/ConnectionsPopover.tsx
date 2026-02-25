'use client';

import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  toast,
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
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsPopoverOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsPopoverOpen(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          className='f-12-500 flex cursor-default items-center gap-x-1'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link2 size={14} className='-rotate-45' />
          {connections?.length}
        </div>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          className='max-h-[300px] w-[400px] overflow-auto p-1'
          avoidCollisions={false}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Accordion type='single' collapsible>
            {connections.map((connection) => {
              const { id, name, description, status, ...metadata } = connection;
              const hasMetadata = Object.keys(metadata).length > 0;

              return (
                <AccordionItem key={id} value={id ?? ''} className='border-b-GRAY_100 last:border-b-0'>
                  <AccordionTrigger
                    icon={() => null}
                    className='hover:bg-GRAY_50 flex items-center justify-between gap-x-2 rounded-md px-2 py-1.5'
                  >
                    <span className='f-12-500 text-GRAY_900 flex-1 truncate text-left'>{name ?? id}</span>
                    <Button
                      variant='outline'
                      size='xsmall'
                      isLoading={deletingConnectionId === id && isDeletingConnection}
                      className='f-11-500 shrink-0 bg-white px-1.5 py-1 hover:bg-white'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveClick(id ?? '');
                      }}
                    >
                      Remove
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className='max-h-[300px] overflow-y-auto px-2 pb-2'>
                    {status && (
                      <p className='f-11-400 text-GRAY_600 mb-1'>
                        Status: <span className='f-11-500'>{status}</span>
                      </p>
                    )}
                    {description && (
                      <p className='f-11-400 text-GRAY_600 mb-1'>
                        Description: <span className='f-11-500'>{description}</span>
                      </p>
                    )}

                    {hasMetadata && (
                      <pre className='bg-GRAY_50 text-GRAY_700 f-11-400 overflow-x-auto rounded-md p-2'>
                        {JSON.stringify(metadata, null, 2)}
                      </pre>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default ConnectionsPopover;
