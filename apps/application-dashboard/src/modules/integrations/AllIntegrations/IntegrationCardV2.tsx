'use client';

import { type FC } from 'react';
import type { ButtonVariant } from '@zamp-platform/ui';
import ConnectIntegrationAction from 'modules/integrations/AllIntegrations/ConnectIntegrationAction';
import ConnectionsPopover from 'modules/integrations/AllIntegrations/ConnectionsPopover';
import IntegrationCardContentV2 from 'modules/integrations/AllIntegrations/IntegrationCardContentV2';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { IntegrationItem } from '@/types/api/integrations';
import { cn } from '@/utils/common';

interface IntegrationCardProps {
  integrationItem: IntegrationItem;
  className?: string;
  redirectUrl?: string;
  enabled?: boolean;
  buttonVariant?: ButtonVariant;
  isToolCallBlock?: boolean;
}

const IntegrationCardV2: FC<IntegrationCardProps> = ({
  integrationItem,
  className,
  redirectUrl,
  enabled = false,
  buttonVariant = 'outline',
  isToolCallBlock = false,
}) => {
  const { name, title, description, icon, connections } = integrationItem;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCardClick = () => {
    const query = searchParams?.toString();
    const url = query ? `${pathname}/${name}?${query}` : `${pathname}/${name}`;

    router.push(url);
  };

  return (
    <div
      className={cn(
        'bg-BG_WHITE border-GRAY_400 group flex min-h-[170px] flex-col justify-between rounded-md border p-3.5 transition-colors select-none',
        !isToolCallBlock &&
          '[&:hover:not(:has(.actions-bar:hover))]:border-GRAY_300 [&:hover:not(:has(.actions-bar:hover))]:bg-BG_GRAY_2 [&:active:not(:has(.actions-bar:hover))]:border-GRAY_300 [&:active:not(:has(.actions-bar:hover))]:bg-GRAY_100 cursor-pointer',
        className,
      )}
      onClick={isToolCallBlock ? undefined : handleCardClick}
    >
      <IntegrationCardContentV2
        logo={icon}
        displayName={title}
        description={description}
        showArrow={!isToolCallBlock}
      />
      <div className='flex w-full items-center justify-between' onClick={(e) => e.stopPropagation()}>
        {connections?.length > 0 && <ConnectionsPopover integrationName={name} connections={connections} />}
        <div className='actions-bar ml-auto'>
          <ConnectIntegrationAction
            integrationItem={integrationItem}
            redirectUrl={redirectUrl}
            copy={enabled ? 'Add Connection' : 'Connect'}
            buttonClassName='f-11-500'
            buttonVariant={buttonVariant}
          />
        </div>
      </div>
    </div>
  );
};

export default IntegrationCardV2;
