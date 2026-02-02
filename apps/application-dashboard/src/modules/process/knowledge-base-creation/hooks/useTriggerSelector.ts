/**
 * Custom hook for trigger selector business logic
 * Separates business logic from UI components (SRP)
 */

import { useCallback, useRef, useState } from 'react';
import { DialogIntent, useDialogState } from 'modules/process/knowledge-base-creation/hooks/useDialogState';
import { Integrations } from '@/apis/integrations';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import type { RootState } from '@/store';

export const useTriggerSelector = () => {
  const dispatch = useAppDispatch();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null);
  const [currentLeaf, setCurrentLeaf] = useState<{ id: string; metadata?: { integration?: IntegrationType } }>();
  const { dialogIntent, openConnectionsDialog, openCreateDialog, closeDialog, handleDialogOpenChange } =
    useDialogState();

  // Get a selector function that can access the state
  // We use useAppSelector to get the state, then store a function to access it in callbacks
  const getState = useAppSelector((state: RootState) => state);
  const stateRef = useRef(getState);

  stateRef.current = getState;

  const resolveLeafIntent = useCallback(
    async (integration: IntegrationType): Promise<DialogIntent> => {
      // Check cache first using the endpoint's select method
      const cacheKey = Integrations.endpoints.getConnectionsByIntegrationName.select({
        integration_name: integration.id,
      });
      const cachedData = cacheKey(stateRef.current);

      // If data is already in cache and fulfilled, use it without making a network call
      if (cachedData?.data && cachedData.status === 'fulfilled') {
        const connections = cachedData.data;

        if (connections.length > 0) {
          return { type: 'connections' as const, connections };
        }

        return { type: 'create' as const };
      }

      // Otherwise, initiate the query (will use cache if available, or fetch if not)
      const queryResult = dispatch(
        Integrations.endpoints.getConnectionsByIntegrationName.initiate(
          { integration_name: integration.id },
          { forceRefetch: false },
        ),
      );

      const connections = await queryResult.unwrap();

      if (connections.length > 0) {
        return { type: 'connections' as const, connections };
      }

      return { type: 'create' as const };
    },
    [dispatch],
  );

  const handleIntegrationSelect = useCallback(
    async (integration: IntegrationType, leaf: { id: string; metadata?: { integration?: IntegrationType } }) => {
      setSelectedIntegration(integration);
      setCurrentLeaf(leaf);
      const result = await resolveLeafIntent(integration);

      if (result?.type === 'connections') {
        openConnectionsDialog(result?.connections);
      } else {
        openCreateDialog();
      }
    },
    [resolveLeafIntent, openConnectionsDialog, openCreateDialog],
  );

  const handleAddAnother = useCallback(() => {
    if (!selectedIntegration) return;
    openCreateDialog();
  }, [selectedIntegration, openCreateDialog]);

  const handleClose = useCallback(() => {
    closeDialog();
    setSelectedIntegration(null);
  }, [closeDialog]);

  return {
    selectedIntegration,
    currentLeaf,
    dialogIntent,
    handleIntegrationSelect,
    handleAddAnother,
    handleClose,
    handleDialogOpenChange,
  };
};
