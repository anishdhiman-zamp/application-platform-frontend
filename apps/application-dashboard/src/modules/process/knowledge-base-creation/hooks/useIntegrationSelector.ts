/**
 * Custom hook for integration selector business logic
 * Separates business logic from UI components (SRP)
 */

import { useCallback, useState } from 'react';
import { useDialogState } from 'modules/process/knowledge-base-creation/hooks/useDialogState';
import { useLazyGetConnectionsByIntegrationNameQuery } from '@/apis/integrations';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { getAvailableConnections } from '@/modules/process/knowledge-base-creation/utils/connectionUtils';
import { ConnectionType } from '@/types/api/integrations';

interface UseIntegrationSelectorProps {
  mappedIntegrations: Array<{ integration: IntegrationType; connections?: ConnectionType[] }>;
}

export const useIntegrationSelector = ({ mappedIntegrations }: UseIntegrationSelectorProps) => {
  const [getConnectionsByIntegrationName] = useLazyGetConnectionsByIntegrationNameQuery();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null);
  const { dialogIntent, openConnectionsDialog, openCreateDialog, closeDialog, handleDialogOpenChange } =
    useDialogState();

  const handleSelectIntegration = useCallback(
    async (integration: IntegrationType) => {
      setSelectedIntegration(integration);
      const { data: connections } = await getConnectionsByIntegrationName({
        integration_name: integration.id,
      });

      if (connections && connections.length > 0) {
        openConnectionsDialog(connections);
      } else {
        openCreateDialog();
      }
    },
    [getConnectionsByIntegrationName, openConnectionsDialog, openCreateDialog],
  );

  const handleAddAnother = useCallback(() => {
    openCreateDialog();
  }, [openCreateDialog]);

  const handleClose = useCallback(() => {
    closeDialog();
    setSelectedIntegration(null);
  }, [closeDialog]);

  const getAvailableConnectionsForIntegration = useCallback(
    (connections: ConnectionType[]) => {
      const allMappedConnections = mappedIntegrations.flatMap((mi) => mi?.connections || []);

      return getAvailableConnections(connections, allMappedConnections);
    },
    [mappedIntegrations],
  );

  return {
    selectedIntegration,
    dialogIntent,
    handleSelectIntegration,
    handleAddAnother,
    handleClose,
    handleDialogOpenChange,
    getAvailableConnections: getAvailableConnectionsForIntegration,
  };
};
