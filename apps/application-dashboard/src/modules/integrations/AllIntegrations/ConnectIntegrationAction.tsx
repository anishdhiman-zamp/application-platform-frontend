'use client';

import { type FC, useMemo, useState } from 'react';
import { Button, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { useAuthenticateIntegrationV2Mutation } from '@/apis/integrations';
import EmailForwardingDialog from '@/modules/integrations/AllIntegrations/components/EmailForwardingDialoge';
import ConnectIntegrationDialog from '@/modules/integrations/AllIntegrations/ConnectIntegrationDialog';
import { AUTH_TYPE, type ConnectIntegrationActionPropsType } from '@/modules/integrations/types/integrations.types';

const ConnectIntegrationAction: FC<ConnectIntegrationActionPropsType> = ({
  integrationItem,
  redirectUrl,
  buttonClassName,
  copy = 'Connect',
  buttonVariant = 'ghost',
  icon: buttonIcon,
}) => {
  const { name, title, icon, auth } = integrationItem;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailForwardingDialogOpen, setIsEmailForwardingDialogOpen] = useState(false);
  const [authenticateIntegrationV2, { isLoading: isAuthenticating }] = useAuthenticateIntegrationV2Mutation();

  const primaryAuth = auth[0];
  const catalogDefaultScopes = useMemo(() => primaryAuth?.default_scopes ?? [], [primaryAuth]);
  const supportsScopes = catalogDefaultScopes.length > 0;

  const handleConnect = (payload?: { name?: string; scopes?: string[] }) => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');

      return;
    }

    if (!primaryAuth) return;

    authenticateIntegrationV2({
      integration_name: name,
      auth_type: primaryAuth.auth_type,
      name: payload?.name ?? '',
      scopes: payload?.scopes,
    })
      .unwrap()
      .then((result) => {
        if (result?.metadata?.redirect_url) {
          window.open(result.metadata.redirect_url, '_blank', 'noopener,noreferrer');
        }
        setIsDialogOpen(false);
      })
      .catch(() => {
        toast.error('Failed to connect integration');
      });
  };

  const handleConnectClick = () => {
    if (redirectUrl) {
      handleConnect();

      return;
    }

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
          'f-11-500 flex items-center gap-1',
          buttonVariant !== 'default' && 'text-GRAY_700 hover:bg-GRAY_100',
          buttonVariant === 'default' && 'hover:bg-GRAY_1000/90 active:bg-GRAY_950',
          buttonClassName,
        )}
      >
        {buttonIcon}
        {copy}
      </Button>
      {!redirectUrl && (
        <ConnectIntegrationDialog
          integrationName={name}
          integrationTitle={title}
          integrationIcon={icon}
          isOpen={isDialogOpen}
          isLoading={isAuthenticating}
          onOpenChange={setIsDialogOpen}
          onConnect={handleConnect}
          defaultScopes={catalogDefaultScopes}
          showScopesOption={supportsScopes}
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
