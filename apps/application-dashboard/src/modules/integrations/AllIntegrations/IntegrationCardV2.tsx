'use client';

import { type FC, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import ConnectIntegrationAction from 'modules/integrations/AllIntegrations/ConnectIntegrationAction';
import ConnectionsPopover from 'modules/integrations/AllIntegrations/ConnectionsPopover';
import IntegrationCardContentV2 from 'modules/integrations/AllIntegrations/IntegrationCardContentV2';
import IntegrationInfoDialog from 'modules/integrations/AllIntegrations/IntegrationInfoDialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useIntegrationConnectionListener } from '@/modules/integrations/hooks/useIntegrationConnectionListener';
import type { IntegrationCardPropsType } from '@/modules/integrations/types/integrations.types';
import { cn } from '@/utils/common';

const IntegrationCardV2: FC<IntegrationCardPropsType> = ({
  integrationItem,
  className,
  redirectUrl,
  enabled = false,
  buttonVariant = 'outline',
  isToolCallBlock = false,
  onCardClick,
}) => {
  const { name, title, description, icon, connections } = integrationItem;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const { isConnected: isLiveConnected } = useIntegrationConnectionListener({
    integrationName: name,
    initiallyConnected: connections?.length > 0,
  });
  const showConnectedPill = isToolCallBlock && isLiveConnected;

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(integrationItem);

      return;
    }

    if (!connections?.length) {
      setIsInfoDialogOpen(true);

      return;
    }

    const query = searchParams?.toString();
    const url = query ? `${pathname}/${name}?${query}` : `${pathname}/${name}`;

    router.push(url);
  };

  return (
    <>
      <div
        className={cn(
          'bg-BG_WHITE border-GRAY_400 group flex min-h-[170px] flex-col justify-between border p-3.5 transition-colors select-none',
          isToolCallBlock ? 'rounded-[16px]' : 'rounded-md',
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
          {connections?.length > 0 && <ConnectionsPopover connections={connections} integrationName={name} />}
          <div className='actions-bar ml-auto'>
            {showConnectedPill ? (
              <span className='bg-GREEN_100 text-GREEN_800 f-11-500 inline-flex items-center gap-1 rounded-md px-2 py-1'>
                <Check size={12} />
                Connected
              </span>
            ) : (
              <ConnectIntegrationAction
                integrationItem={integrationItem}
                redirectUrl={redirectUrl}
                copy={enabled ? 'Add Connection' : 'Connect'}
                buttonClassName='f-11-500'
                buttonVariant={buttonVariant}
                icon={<Plus size={12} />}
              />
            )}
          </div>
        </div>
      </div>

      <IntegrationInfoDialog
        integrationItem={integrationItem}
        isOpen={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
      />
    </>
  );
};

export default IntegrationCardV2;
