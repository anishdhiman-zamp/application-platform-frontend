'use client';

import { useCallback, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zamp-platform/ui';
import { Link2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { handleActivationKeyDown } from '@/constants/shortcuts';
import ConnectionAudienceBubbles from '@/modules/integrations/AllIntegrations/ConnectionAudienceBubbles';
import type { ConnectionsPopoverPropsType } from '@/modules/integrations/types/integrations.types';

const ConnectionsPopover = ({ connections, integrationName }: ConnectionsPopoverPropsType) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleConnectionClick = useCallback(
    (connectionId: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');

      params.set('connectionId', connectionId);
      router.push(`${pathname}/${integrationName}?${params.toString()}`);
    },
    [router, pathname, integrationName, searchParams],
  );

  const handleConnectionKeyDown = useCallback(
    (e: React.KeyboardEvent, connectionId?: string) => {
      if (!connectionId) return;
      handleActivationKeyDown(e, () => handleConnectionClick(connectionId));
    },
    [handleConnectionClick],
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
          className='max-h-[300px] w-[280px] overflow-auto p-1'
          align='start'
          avoidCollisions={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className='flex flex-col'>
            {connections.map((connection) => (
              <div
                key={connection?.id}
                role='button'
                tabIndex={0}
                onClick={() => connection?.id && handleConnectionClick(connection.id)}
                onKeyDown={(e) => handleConnectionKeyDown(e, connection?.id)}
                className='hover:bg-GRAY_50 flex cursor-pointer items-center justify-between gap-x-2 rounded-md px-2 py-1.5'
              >
                <span className='f-12-500 text-GRAY_900 min-w-0 flex-1 truncate text-left'>
                  {connection?.name ?? connection?.id}
                </span>
                {connection?.id && <ConnectionAudienceBubbles connectionId={connection.id} />}
              </div>
            ))}
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default ConnectionsPopover;
