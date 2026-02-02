/**
 * Custom hook for trigger subscription operations
 * Separates trigger subscription logic from UI components (SRP)
 */

import { useCallback } from 'react';
import { toast } from '@zamp-platform/ui';
import { useParams } from 'next/navigation';
import { useCreateProcessConnectionMappingMutation } from '@/apis/integrations';
import { useCreateTriggerSubscriptionMutation } from '@/apis/triggers';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { ConnectionType } from '@/types/api/integrations';

interface UseTriggerSubscriptionProps {
  processConnectionMappings?: { mappings: Array<{ connection: ConnectionType }> };
}

export const useTriggerSubscription = ({ processConnectionMappings }: UseTriggerSubscriptionProps = {}) => {
  const params = useParams();
  const [createTriggerSubscription, { isLoading: isCreatingTriggerSubscription }] =
    useCreateTriggerSubscriptionMutation();
  const [createProcessConnectionMapping] = useCreateProcessConnectionMappingMutation();

  const createTrigger = useCallback(
    (integration: IntegrationType, connection: ConnectionType, triggerName: string, onSuccess?: () => void) => {
      // Check if connection is already mapped to the process
      const isConnectionMapped =
        processConnectionMappings?.mappings.some((mapping) => mapping.connection.id === connection.id) ?? false;

      // Create promises array for parallel execution
      const promises: Promise<unknown>[] = [
        createTriggerSubscription({
          integration_name: integration.id,
          connection_id: connection.id,
          trigger_type: 'AUTOMATED',
          trigger_name: triggerName,
          resource_type: 'process',
          resource_id: params?.processId as string,
        }).unwrap(),
      ];

      // If connection is not mapped, create the mapping in parallel
      if (!isConnectionMapped) {
        promises.push(
          createProcessConnectionMapping({
            process_id: params?.processId as string,
            connection_id: connection.id,
          }).unwrap(),
        );
      }

      Promise.all(promises)
        .then(() => {
          toast.success('Trigger subscription created successfully');
          onSuccess?.();
        })
        .catch(() => {
          toast.error('Failed to create trigger subscription');
        });
    },
    [createTriggerSubscription, createProcessConnectionMapping, params?.processId, processConnectionMappings],
  );

  return {
    createTrigger,
    isCreatingTriggerSubscription,
  };
};
