/**
 * Custom hook for IntegrationSelector component logic
 */

import { useCallback, useMemo } from 'react';
import { useConnectionManagement } from 'modules/process/knowledge-base-creation/hooks/useConnectionManagement';
import { useIntegrationSelector } from 'modules/process/knowledge-base-creation/hooks/useIntegrationSelector';
import { buildMappedIntegrationsList } from 'modules/process/knowledge-base-creation/utils/buildMappedIntegrationsList';
import { createTempConnection } from 'modules/process/knowledge-base-creation/utils/connectionUtils';
import { useParams } from 'next/navigation';
import { useGetProcessConnectionMappingsQuery } from '@/apis/integrations';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { ConnectionType } from '@/types/api/integrations';

export const useIntegrationSelectorLogic = ({ integrations }: { integrations: IntegrationType[] }) => {
  const params = useParams();

  const { data: processConnectionMappings, isLoading: isFetchingProcessConnectionMappings } =
    useGetProcessConnectionMappingsQuery(params?.processId as string);

  const mappedIntegrations = useMemo(
    () => buildMappedIntegrationsList(params?.processId as string, integrations, processConnectionMappings),
    [params?.processId, integrations, processConnectionMappings],
  );

  const {
    selectedIntegration,
    dialogIntent,
    handleSelectIntegration,
    handleAddAnother,
    handleClose,
    handleDialogOpenChange,
    getAvailableConnections,
  } = useIntegrationSelector({ mappedIntegrations });

  const { handleConnect, isCreatingProcessConnectionMapping } = useConnectionManagement({
    integrationId: selectedIntegration?.id || '',
    mappedConnections: [],
  });

  const handleConnectWrapper = useCallback(
    (connection: ConnectionType) => {
      handleConnect(connection, () => handleClose());
    },
    [handleConnect, handleClose],
  );

  const handleCreateConnectionMapping = useCallback(
    (connectionId: string) => {
      const tempConnection = createTempConnection(connectionId);

      handleConnectWrapper(tempConnection);
    },
    [handleConnectWrapper],
  );

  const availableIntegrations = useMemo(() => {
    const filtered: IntegrationType[] = [];
    const comingSoonIntegrations: (IntegrationType & { disabled?: boolean; rightText?: string })[] = [];

    // Single loop to categorize integrations
    integrations.forEach((integration) => {
      const hasEvents = integration.events && integration.events.length > 0;
      const isMapped = mappedIntegrations.some(
        (mappedIntegration) => mappedIntegration?.integration?.id === integration.id,
      );

      if (hasEvents && !isMapped) {
        // Available integration with events and not mapped
        filtered.push(integration);
      } else if (!hasEvents) {
        // Integration without events - mark as coming soon
        comingSoonIntegrations.push({
          ...integration,
          disabled: true,
          rightText: 'Coming soon',
        });
      }
    });

    // Add coming soon integrations if there's at least 1 available integration
    if (filtered.length > 0) {
      return [...filtered, ...comingSoonIntegrations];
    }

    return filtered;
  }, [integrations, mappedIntegrations]);

  const hasAvailableIntegrations = availableIntegrations.length > 0;
  const hasMappedIntegrations = mappedIntegrations.length > 0;

  return {
    mappedIntegrations,
    availableIntegrations,
    hasAvailableIntegrations,
    hasMappedIntegrations,
    isFetchingProcessConnectionMappings,
    selectedIntegration,
    dialogIntent,
    handleSelectIntegration,
    handleAddAnother,
    handleClose,
    handleDialogOpenChange,
    getAvailableConnections,
    handleConnectWrapper,
    isCreatingProcessConnectionMapping,
    handleCreateConnectionMapping,
  };
};
