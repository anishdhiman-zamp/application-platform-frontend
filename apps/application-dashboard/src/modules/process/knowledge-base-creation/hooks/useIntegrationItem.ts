/**
 * Custom hook for IntegrationItem component logic
 */

import { useCallback, useState } from 'react';
import { useConnectionManagement } from 'modules/process/knowledge-base-creation/hooks/useConnectionManagement';
import { useDialogState } from 'modules/process/knowledge-base-creation/hooks/useDialogState';
import { MappedIntegrationType } from 'modules/process/knowledge-base-creation/utils/buildMappedIntegrationsList';
import { useParams } from 'next/navigation';
import { createTempConnection } from '@/modules/process/knowledge-base-creation/utils/connectionUtils';
import {
  CombinedTriggerType,
  getFilteredTriggersForConnection,
} from '@/modules/process/knowledge-base-creation/utils/triggerUtils';
import { ConnectionType } from '@/types/api/integrations';

interface UseIntegrationItemProps {
  mappedIntegration: MappedIntegrationType;
}

export const useIntegrationItem = ({ mappedIntegration }: UseIntegrationItemProps) => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<ConnectionType | null>(null);
  const [filteredCombinedTriggers, setFilteredCombinedTriggers] = useState<CombinedTriggerType[]>([]);
  const { dialogIntent, openConnectionsDialog, openCreateDialog, closeDialog, handleDialogOpenChange } =
    useDialogState();

  const {
    connectionsToAdd,
    handleConnect,
    handleRemoveConnection: removeConnection,
    isCreatingProcessConnectionMapping,
    isDeletingProcessConnectionMapping,
  } = useConnectionManagement({
    integrationId: mappedIntegration?.integration?.id,
    mappedConnections: mappedIntegration?.connections,
  });

  const handleRemoveConnection = useCallback(() => {
    if (!connectionToDelete) return;

    // Close dialog immediately - UI already updated optimistically
    setOpen(false);
    setConnectionToDelete(null);

    // Fire and forget - mutations handle optimistic updates and rollback on error
    removeConnection(connectionToDelete);
  }, [connectionToDelete, removeConnection]);

  const handleOpenDeleteDialog = useCallback(
    (connection: ConnectionType) => {
      const triggers = getFilteredTriggersForConnection(params?.processId as string, connection.name);

      setFilteredCombinedTriggers(triggers);
      setConnectionToDelete(connection);
      setOpen(true);
    },
    [params?.processId],
  );

  const handleAddConnection = useCallback(() => {
    if (connectionsToAdd.length === 0) {
      openCreateDialog();
    } else {
      openConnectionsDialog(connectionsToAdd);
    }
  }, [connectionsToAdd, openCreateDialog, openConnectionsDialog]);

  const handleConnectWrapper = useCallback(
    (connection: ConnectionType) => {
      handleConnect(connection, () => closeDialog());
    },
    [handleConnect, closeDialog],
  );

  const handleListOpenChange = useCallback(
    (open: boolean) => {
      handleDialogOpenChange(open);
    },
    [handleDialogOpenChange],
  );

  const handleCloseDeleteDialog = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const handleAddAnother = useCallback(() => {
    openCreateDialog();
  }, [openCreateDialog]);

  const handleCreateConnectionMapping = useCallback(
    (connectionId: string) => {
      const tempConnection = createTempConnection(connectionId);

      handleConnectWrapper(tempConnection);
    },
    [handleConnectWrapper],
  );

  return {
    open,
    setOpen,
    connectionToDelete,
    filteredCombinedTriggers,
    dialogIntent,
    connectionsToAdd,
    isCreatingProcessConnectionMapping,
    isDeletingProcessConnectionMapping,
    handleRemoveConnection,
    handleOpenDeleteDialog,
    handleAddConnection,
    handleConnectWrapper,
    handleListOpenChange,
    handleCloseDeleteDialog,
    handleAddAnother,
    handleCreateConnectionMapping,
  };
};
