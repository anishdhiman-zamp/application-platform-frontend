/**
 * Custom hook for TriggerSelector component logic
 */

import { useCallback, useMemo } from 'react';
import type { MenuNode } from '@zamp-platform/ui';
import { useTriggerSelector } from 'modules/process/knowledge-base-creation/hooks/useTriggerSelector';
import { useTriggerSubscription } from 'modules/process/knowledge-base-creation/hooks/useTriggerSubscription';
import { buildMenuFromIntegrations } from 'modules/process/knowledge-base-creation/utils/buildMenuFromIntegrations';
import { createTempConnection } from 'modules/process/knowledge-base-creation/utils/connectionUtils';
import { useParams } from 'next/navigation';
import { Integrations, useGetProcessConnectionMappingsQuery } from '@/apis/integrations';
import { useGetTriggerSubscriptionsForResourceQuery } from '@/apis/triggers';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { combineTriggersWithConnections } from '@/modules/process/knowledge-base-creation/utils/triggerUtils';
import { ConnectionType } from '@/types/api/integrations';

export const useTriggerSelectorLogic = ({ integrations }: { integrations: IntegrationType[] }) => {
  const params = useParams();

  const { data: triggerSubscriptions, isLoading: isFetchingTriggerSubscriptions } =
    useGetTriggerSubscriptionsForResourceQuery({
      resource_type: 'process',
      resource_id: params?.processId as string,
    });
  const { data: processConnectionMappings, isLoading: isFetchingProcessConnectionMappings } =
    useGetProcessConnectionMappingsQuery(params?.processId as string);

  const prefetchConnections = Integrations.usePrefetch('getConnectionsByIntegrationName');

  const handlePointerEnter = useCallback(
    (item: MenuNode) => {
      prefetchConnections({ integration_name: item.id });
    },
    [prefetchConnections],
  );

  const {
    selectedIntegration,
    currentLeaf,
    dialogIntent,
    handleIntegrationSelect,
    handleAddAnother,
    handleClose,
    handleDialogOpenChange,
  } = useTriggerSelector();

  const { createTrigger, isCreatingTriggerSubscription } = useTriggerSubscription({
    processConnectionMappings,
  });

  const menuNode = useMemo(() => buildMenuFromIntegrations(integrations), [integrations]);

  const combinedTriggers = useMemo(
    () =>
      combineTriggersWithConnections(
        params?.processId as string,
        triggerSubscriptions,
        processConnectionMappings,
        integrations,
      ),
    [params?.processId, triggerSubscriptions, processConnectionMappings, integrations],
  );

  const hasTriggers = combinedTriggers.length > 0;

  const handleClick = useCallback(
    async (item: MenuNode) => {
      // Prevent clicks on disabled items
      if (item.disabled === true) return;

      const integration = item.metadata?.integration as IntegrationType | undefined;

      if (!integration) return;
      await handleIntegrationSelect(integration, item);
    },
    [handleIntegrationSelect],
  );

  const handleConnect = useCallback(
    (selectedConnection: ConnectionType) => {
      const integration = currentLeaf?.metadata?.integration as IntegrationType | undefined;

      if (!integration) return;

      createTrigger(integration, selectedConnection, currentLeaf?.id as string, handleClose);
    },
    [currentLeaf, createTrigger, handleClose],
  );

  const handleCreateTrigger = useCallback(
    (connectionId: string) => {
      const integration = currentLeaf?.metadata?.integration as IntegrationType | undefined;

      if (!integration) return;

      // Create a temporary connection object for the service
      const tempConnection = createTempConnection(connectionId, integration.id);

      createTrigger(integration, tempConnection, currentLeaf?.id as string, handleClose);
    },
    [currentLeaf, createTrigger, handleClose],
  );

  const availableConnections = useMemo(() => {
    if (dialogIntent?.type !== 'connections') return [];

    return dialogIntent?.connections?.filter(
      (connection) => !combinedTriggers?.some((trigger) => trigger.connection_name === connection.name),
    );
  }, [dialogIntent, combinedTriggers]);

  return {
    triggerSubscriptions,
    isFetchingTriggerSubscriptions,
    isFetchingProcessConnectionMappings,
    hasTriggers,
    combinedTriggers,
    menuNode,
    selectedIntegration,
    dialogIntent,
    availableConnections,
    isCreatingTriggerSubscription,
    handlePointerEnter,
    handleClick,
    handleConnect,
    handleAddAnother,
    handleClose,
    handleDialogOpenChange,
    handleCreateTrigger,
  };
};
