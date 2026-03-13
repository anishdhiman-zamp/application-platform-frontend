'use client';

import { type FC, useState } from 'react';
import { Button, ButtonVariant, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { useAuthenticateIntegrationV2Mutation } from '@/apis/integrations';
import EmailForwardingDialog from '@/modules/integrations/AllIntegrations/components/EmailForwardingDialoge';
import ConnectIntegrationDialog from '@/modules/integrations/AllIntegrations/ConnectIntegrationDialog';
import { AUTH_TYPE } from '@/modules/integrations/types/integrations.types';
import type { IntegrationItem } from '@/types/api/integrations';

interface ConnectIntegrationActionProps {
  integrationItem: IntegrationItem;
  redirectUrl?: string;
  buttonClassName?: string;
  copy?: string;
  buttonVariant?: ButtonVariant;
}

const ConnectIntegrationAction: FC<ConnectIntegrationActionProps> = ({
  integrationItem,
  redirectUrl,
  buttonClassName,
  copy = 'Connect',
  buttonVariant = 'ghost',
}) => {
  const { name, title, auth } = integrationItem;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailForwardingDialogOpen, setIsEmailForwardingDialogOpen] = useState(false);
  const [authenticateIntegrationV2, { isLoading: isAuthenticating }] = useAuthenticateIntegrationV2Mutation();

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

      return;
    }

    const primaryAuth = auth[0];

    if (primaryAuth?.auth_type === AUTH_TYPE.CUSTOM) {
      setIsEmailForwardingDialogOpen(true);

      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size='small'
        onClick={handleConnectClick}
        className={cn(
          'f-11-500',
          buttonVariant !== 'default' && 'text-GRAY_700 hover:bg-GRAY_100',
          buttonVariant === 'default' && 'hover:bg-GRAY_1000/90 active:bg-GRAY_950',
          buttonClassName,
        )}
      >
        {copy}
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
      <EmailForwardingDialog
        integration={integrationItem}
        isOpen={isEmailForwardingDialogOpen}
        onClose={() => setIsEmailForwardingDialogOpen(false)}
      />
    </>
  );
};

export default ConnectIntegrationAction;
