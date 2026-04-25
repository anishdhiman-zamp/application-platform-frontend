'use client';

import { useMemo, useState } from 'react';
import { Button, ScrollContainer } from '@zamp-platform/ui';
import { ArrowLeft } from 'lucide-react';
import IntegrationGridV2 from 'modules/integrations/AllIntegrations/IntegrationGridV2';
import IntegrationHeader from 'modules/integrations/AllIntegrations/IntegrationHeader';
import IntegrationInfoDialog from 'modules/integrations/AllIntegrations/IntegrationInfoDialog';
import { useIntegrationsContext } from '@/modules/integrations/AllIntegrations/Integrations.context';
import ConnectionPeopleTab from '@/modules/integrations/IntegrationDetail/ConnectionPeopleTab';
import IntegrationDetailHeader from '@/modules/integrations/IntegrationDetail/IntegrationDetailHeader';
import type { ConnectionEntryType } from '@/modules/integrations/types/integrations.types';
import type { IntegrationItem } from '@/types/api/integrations';

const AddConnectionModalContent = () => {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [infoIntegration, setInfoIntegration] = useState<IntegrationItem | null>(null);
  const [selectedIntegrationName, setSelectedIntegrationName] = useState<string | null>(null);

  const { items, enabledItems } = useIntegrationsContext();

  const selectedIntegration = useMemo(() => {
    if (!selectedIntegrationName) return null;

    return (
      enabledItems?.find((i) => i?.name === selectedIntegrationName) ||
      items?.find((i) => i?.name === selectedIntegrationName) ||
      null
    );
  }, [selectedIntegrationName, items, enabledItems]);

  const selectedConnections = useMemo<ConnectionEntryType[]>(
    () =>
      (selectedIntegration?.connections ?? [])
        .filter((c): c is { id: string; name?: string } & typeof c => !!c?.id)
        .map((c) => ({ id: c.id!, name: c.name ?? '' })),
    [selectedIntegration],
  );

  const handleCardClick = (item: IntegrationItem) => {
    if (!item?.connections?.length) {
      setInfoIntegration(item);
      setIsInfoDialogOpen(true);

      return;
    }
    setSelectedIntegrationName(item?.name);
  };

  const handleBack = () => {
    setSelectedIntegrationName(null);
  };

  const handleInfoDialogOpenChange = (open: boolean) => {
    setIsInfoDialogOpen(open);
  };

  if (selectedIntegration) {
    return (
      <div className='flex min-h-0 flex-1 flex-col px-6'>
        <div className='shrink-0'>
          <Button
            variant='ghost'
            size='small'
            onClick={handleBack}
            className='text-GRAY_700 hover:text-GRAY_1000 mt-3 mb-4 self-start p-1'
            aria-label='Go back'
          >
            <ArrowLeft size={16} />
          </Button>
          <IntegrationDetailHeader
            displayName={selectedIntegration.title}
            logo={selectedIntegration.icon}
            integrationItem={selectedIntegration}
          />
        </div>
        <ScrollContainer className='mt-6 min-h-0 flex-1' scrollClassName='' scrollbarStyle='none'>
          {selectedConnections.length > 0 ? (
            <ConnectionPeopleTab
              connections={selectedConnections}
              integrationName={selectedIntegration.name}
              integrationLogo={selectedIntegration.icon}
            />
          ) : (
            <span className='f-13-450 text-GRAY_700'>No connections found for this integration</span>
          )}
        </ScrollContainer>
      </div>
    );
  }

  return (
    <>
      <div className='shrink-0 px-6 pt-14 pb-4'>
        <IntegrationHeader title='Connections' />
      </div>
      <ScrollContainer scrollClassName='px-6 pb-6' scrollbarStyle='none'>
        <IntegrationGridV2 onCardClick={handleCardClick} />
      </ScrollContainer>
      {infoIntegration && (
        <IntegrationInfoDialog
          integrationItem={infoIntegration}
          isOpen={isInfoDialogOpen}
          onOpenChange={handleInfoDialogOpenChange}
        />
      )}
    </>
  );
};

export default AddConnectionModalContent;
