'use client';

import { type FC } from 'react';
import ConnectIntegrationAction from 'modules/integrations/AllIntegrations/ConnectIntegrationAction';
import ConnectionsPopover from 'modules/integrations/AllIntegrations/ConnectionsPopover';
import IntegrationCardContentV2 from 'modules/integrations/AllIntegrations/IntegrationCardContentV2';
import { usePathname, useRouter } from 'next/navigation';
import type { IntegrationItem } from '@/types/api/integrations';
import { cn } from '@/utils/common';

interface IntegrationCardProps {
  integrationItem: IntegrationItem;
  className?: string;
  redirectUrl?: string;
  enabled?: boolean;
}

const IntegrationCardV2: FC<IntegrationCardProps> = ({ integrationItem, className, redirectUrl, enabled = false }) => {
  const { name, title, description, icon, connections } = integrationItem;
  const router = useRouter();
  const pathname = usePathname();

  const handleCardClick = () => {
    router.push(`${pathname}/${name}`);
  };

  return (
    <div
      className={cn(
        'border-GRAY_400 group [&:hover:not(:has(.actions-bar:hover))]:border-GRAY_300 [&:hover:not(:has(.actions-bar:hover))]:bg-BG_GRAY_2 [&:active:not(:has(.actions-bar:hover))]:border-GRAY_300 [&:active:not(:has(.actions-bar:hover))]:bg-GRAY_100 flex min-h-[170px] cursor-pointer flex-col justify-between rounded-md border bg-white p-3.5 transition-colors select-none',
        className,
      )}
      onClick={handleCardClick}
    >
      <IntegrationCardContentV2 logo={icon} displayName={title} description={description} />
      <div className='flex w-full items-center justify-between' onClick={(e) => e.stopPropagation()}>
        {connections?.length > 0 && <ConnectionsPopover integrationName={name} connections={connections} />}
        <div className='actions-bar ml-auto'>
          <ConnectIntegrationAction
            integrationItem={integrationItem}
            redirectUrl={redirectUrl}
            copy={enabled ? 'Add Connection' : 'Connect'}
            buttonClassName='text-GRAY_700 f-11-500 hover:bg-GRAY_100'
          />
        </div>
      </div>
    </div>
  );
};

export default IntegrationCardV2;
