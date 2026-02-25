'use client';

import { type FC, useState } from 'react';
import { Button, toast } from '@zamp-platform/ui';
import EmailForwardingDialog from 'modules/integrations/AllIntegrations/components/EmailForwardingDialoge';
import ConnectIntegrationDialog from 'modules/integrations/AllIntegrations/ConnectIntegrationDialog';
import ConnectionsPopover from 'modules/integrations/AllIntegrations/ConnectionsPopover';
import IntegrationCardContentV2 from 'modules/integrations/AllIntegrations/IntegrationCardContentV2';
import { useAuthenticateIntegrationV2Mutation } from '@/apis/integrations';
import { AUTH_TYPE } from '@/modules/integrations/types/integrations.types';
import type { IntegrationItem } from '@/types/api/integrations';
import { cn } from '@/utils/common';

interface IntegrationCardProps {
  integrationItem: IntegrationItem;
  className?: string;
  redirectUrl?: string;
}

const IntegrationCardV2: FC<IntegrationCardProps> = ({ integrationItem, className, redirectUrl }) => {
  const { name, title, description, icon, auth, connections } = integrationItem;
  const [authenticateIntegrationV2, { isLoading: isAuthenticating }] = useAuthenticateIntegrationV2Mutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailForwardingDialogOpen, setIsEmailForwardingDialogOpen] = useState(false);

  const handleConnect = async (payload?: { name?: string; description?: string }) => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');

      return;
    }

    const primaryAuth = auth[0];

    if (!primaryAuth) return;

    try {
      const result = await authenticateIntegrationV2({
        integration_name: name,
        auth_type: primaryAuth.auth_type,
        name: payload?.name ?? '',
        description: payload?.description ?? '',
      }).unwrap();

      if (result.metadata.redirect_url) {
        window.open(result.metadata.redirect_url, '_blank', 'noopener,noreferrer');
      }

      setIsDialogOpen(false);
    } catch {
      toast.error('Failed to connect integration');
    }
  };

  const handleConnectClick = () => {
    if (redirectUrl) {
      handleConnect();
    } else {
      const primaryAuth = auth[0];

      if (primaryAuth?.auth_type === AUTH_TYPE.CUSTOM) {
        setIsEmailForwardingDialogOpen(true);

        return;
      }
      setIsDialogOpen(true);
    }
  };

  return (
    <div
      className={cn(
        'border-GRAY_400 flex min-h-[170px] flex-col justify-between rounded-md border bg-white p-3.5 transition-colors select-none',
        className,
      )}
    >
      <IntegrationCardContentV2 logo={icon} displayName={title} description={description} />
      <div className='flex w-full items-center justify-between'>
        {connections?.length > 0 && <ConnectionsPopover integrationName={name} connections={connections} />}
        <Button
          variant='ghost'
          size='small'
          onClick={handleConnectClick}
          className='text-GRAY_700 f-11-500 hover:bg-GRAY_100 group-hover:text-GRAY_1000 group-active:text-GRAY_1000 ml-auto'
        >
          Connect
        </Button>
        {!redirectUrl && (
          <ConnectIntegrationDialog
            integrationName={name}
            integrationTitle={title}
            isOpen={isDialogOpen}
            isLoading={isAuthenticating}
            onOpenChange={setIsDialogOpen}
            onConnect={handleConnect}
          />
        )}
      </div>
      <EmailForwardingDialog
        integration={integrationItem}
        isOpen={isEmailForwardingDialogOpen}
        onClose={() => setIsEmailForwardingDialogOpen(false)}
      />
    </div>
  );
};

export default IntegrationCardV2;
