/**
 * Custom hook for connection management operations
 * Separates business logic from UI components (SRP)
 */

import { useCallback, useMemo } from 'react';
import { toast } from '@zamp-platform/ui';
import { useParams } from 'next/navigation';
import {
  useCreateProcessConnectionMappingMutation,
  useDeleteProcessConnectionMappingMutation,
  useGetConnectionsByIntegrationNameQuery,
} from '@/apis/integrations';
import { useDeleteTriggerSubscriptionMutation } from '@/apis/triggers';
import { getAvailableConnections } from '@/modules/process/knowledge-base-creation/utils/connectionUtils';
import { getFilteredTriggersForConnection } from '@/modules/process/knowledge-base-creation/utils/triggerUtils';
import { ConnectionType } from '@/types/api/integrations';

interface UseConnectionManagementProps {
  integrationId: string;
  mappedConnections?: ConnectionType[];
}

export const useConnectionManagement = ({ integrationId, mappedConnections = [] }: UseConnectionManagementProps) => {
  const params = useParams();
  const [deleteProcessConnectionMapping, { isLoading: isDeletingProcessConnectionMapping }] =
    useDeleteProcessConnectionMappingMutation();
  const [deleteTriggerSubscription] = useDeleteTriggerSubscriptionMutation();
  const { data: connections } = useGetConnectionsByIntegrationNameQuery(
    {
      integration_name: integrationId,
      params: { page: 1, limit: 100 },
    },
    { skip: !integrationId, refetchOnMountOrArgChange: false },
  );
  const [createProcessConnectionMapping, { isLoading: isCreatingProcessConnectionMapping }] =
    useCreateProcessConnectionMappingMutation();

  const connectionsToAdd = useMemo(() => {
    if (!connections) return [];

    return getAvailableConnections(connections?.connections || [], mappedConnections);
  }, [connections, mappedConnections]);

  const handleConnect = useCallback(
    (connection: ConnectionType, onSuccess?: () => void) => {
      createProcessConnectionMapping({
        process_id: params?.processId as string,
        connection_id: connection.id,
      })
        .unwrap()
        .then(() => {
          toast.success('Connection added successfully');
          onSuccess?.();
        })
        .catch(() => {
          toast.error('Failed to create process connection mapping');
        });
    },
    [createProcessConnectionMapping, params?.processId],
  );

  const handleRemoveConnection = useCallback(
    (connection: ConnectionType) => {
      const filteredCombinedTriggers = getFilteredTriggersForConnection(params?.processId as string, connection.name);

      // Delete trigger subscriptions for each filtered trigger
      const deleteTriggerPromises = filteredCombinedTriggers.map((trigger) =>
        deleteTriggerSubscription({ subscription_id: trigger.id }).unwrap(),
      );

      // Delete connection mapping in parallel with trigger deletions
      const deleteConnectionMappingPromise = deleteProcessConnectionMapping({
        process_id: params?.processId as string,
        connection_id: connection.id,
      }).unwrap();

      // Execute all deletions in parallel
      return Promise.all([...deleteTriggerPromises, deleteConnectionMappingPromise])
        .then(() => {
          // Success - no toast needed, UI already updated optimistically
        })
        .catch(() => {
          // Error - connection mapping will be restored by the mutation's rollback
          toast.error('Failed to delete process connection mapping');
        });
    },
    [deleteProcessConnectionMapping, deleteTriggerSubscription, params?.processId],
  );

  return {
    connections,
    connectionsToAdd,
    handleConnect,
    handleRemoveConnection,
    isCreatingProcessConnectionMapping,
    isDeletingProcessConnectionMapping,
  };
};
