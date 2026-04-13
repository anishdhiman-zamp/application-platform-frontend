'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button, CSS_VARS, toast } from '@zamp-platform/ui';
import { ArrowLeft } from 'lucide-react';
import IntegrationGridV2 from 'modules/integrations/AllIntegrations/IntegrationGridV2';
import IntegrationHeader from 'modules/integrations/AllIntegrations/IntegrationHeader';
import { useDeleteIntegrationConnectionMutation } from '@/apis/integrations';
import { useIntegrationsContext } from '@/modules/integrations/AllIntegrations/Integrations.context';
import IntegrationDetailHeader from '@/modules/integrations/IntegrationDetail/IntegrationDetailHeader';
import ShareConnectionPopup from '@/modules/integrations/IntegrationDetail/ShareConnectionPopup';
import type { IntegrationItem } from '@/types/api/integrations';

const AddConnectionModalContent = () => {
  const [deletingConnectionId, setDeletingConnectionId] = useState<string | null>(null);
  const [selectedIntegrationName, setSelectedIntegrationName] = useState<string | null>(null);

  const { items, enabledItems, removeConnection } = useIntegrationsContext();
  const [deleteIntegrationConnection] = useDeleteIntegrationConnectionMutation();

  const selectedIntegration = useMemo(() => {
    if (!selectedIntegrationName) return null;

    return (
      enabledItems?.find((i) => i?.name === selectedIntegrationName) ||
      items?.find((i) => i?.name === selectedIntegrationName) ||
      null
    );
  }, [selectedIntegrationName, items, enabledItems]);

  const handleCardClick = useCallback((item: IntegrationItem) => {
    setSelectedIntegrationName(item?.name);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedIntegrationName(null);
  }, []);

  const handleRemoveConnection = useCallback(
    (connectionId: string) => {
      if (!selectedIntegrationName) return;
      setDeletingConnectionId(connectionId);
      deleteIntegrationConnection({ connectionId })
        .unwrap()
        .then(() => {
          toast.success('Connection removed successfully');
          removeConnection(selectedIntegrationName, connectionId);
        })
        .catch(() => {
          toast.error('Failed to remove connection');
        })
        .finally(() => {
          setDeletingConnectionId(null);
        });
    },
    [deleteIntegrationConnection, selectedIntegrationName, removeConnection],
  );

  if (selectedIntegration) {
    return (
      <div className='flex min-h-0 flex-1 flex-col px-6'>
        <Button variant='ghost' size='small' onClick={handleBack} className='shrink-0 py-5' aria-label='Go back'>
          <ArrowLeft size={14} color={CSS_VARS.GRAY_900} />
        </Button>
        <div className='min-h-0 flex-1 overflow-y-auto pb-6 [scrollbar-width:none]'>
          <div className='flex flex-col gap-y-5'>
            <IntegrationDetailHeader
              displayName={selectedIntegration.title}
              logo={selectedIntegration.icon}
              integrationItem={selectedIntegration}
            />
            {selectedIntegration.description && (
              <span className='f-14-500 text-GRAY_900'>{selectedIntegration.description}</span>
            )}
            <div className='mt-4 flex flex-col'>
              {(selectedIntegration.connections ?? []).length > 0 ? (
                <div className='flex w-full flex-col gap-y-8'>
                  {selectedIntegration.connections?.map((account) => (
                    <div key={account?.id} className='flex w-full items-center justify-between'>
                      <span className='f-12-450 text-GRAY_700'>{account?.name}</span>
                      {account?.id && (
                        <div className='flex items-center gap-x-2'>
                          <Button
                            size='xsmall'
                            className='f-11-500'
                            onClick={() => handleRemoveConnection(account.id!)}
                            isLoading={deletingConnectionId === account?.id}
                          >
                            Remove
                          </Button>
                          <ShareConnectionPopup connectionId={account?.id} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className='f-13-450 text-GRAY_700'>No connections found for this integration</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='shrink-0 px-6 pt-6'>
        <IntegrationHeader />
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:none]'>
        <IntegrationGridV2 onCardClick={handleCardClick} />
      </div>
    </>
  );
};

export default AddConnectionModalContent;
