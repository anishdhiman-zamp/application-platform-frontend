import { IntegrationType } from '@/modules/integrations/types/integrations.types';
import type { GetProcessConnectionMappingsResponseType } from '@/types/api/integrations';
import type { TriggerSubscriptionResponseType } from '@/types/api/triggers';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

export type CombinedTriggerType = {
  id: string;
  trigger_name: string;
  connection_name: string;
  trigger_display_name: string;
  integration_logo: string;
};

/**
 * Combines trigger subscriptions with process connection mappings to create a list of triggers
 * with connection names.
 *
 * @param processId - Process ID to key the storage
 * @param triggerSubscriptions - Array of trigger subscriptions
 * @param processConnectionMappings - Process connection mappings response
 * @param integrations - Array of integrations
 * @returns Array of combined trigger objects with id, trigger_name, and connection_name
 */
export const combineTriggersWithConnections = (
  processId: string,
  triggerSubscriptions: TriggerSubscriptionResponseType[] | undefined,
  processConnectionMappings: GetProcessConnectionMappingsResponseType | undefined,
  integrations: IntegrationType[] | undefined,
): CombinedTriggerType[] => {
  if (!triggerSubscriptions || !processConnectionMappings || !integrations || !integrations.length) {
    // Check local storage before returning empty array
    const storedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.COMBINED_TRIGGERS);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        if (parsedData[processId]) {
          return parsedData[processId];
        }
      } catch {
        // If parsing fails, continue to return empty array
      }
    }

    return [];
  }

  // Create a map of connection_id -> connection_name for quick lookup
  const connectionMap = new Map<string, string>();

  processConnectionMappings.mappings.forEach((mapping) => {
    if (mapping.connection?.id && mapping.connection?.name) {
      connectionMap.set(mapping.connection.id, mapping.connection.name);
    }
  });

  // Combine trigger subscriptions with connection names
  const result = triggerSubscriptions.map((subscription) => {
    const connection_name = connectionMap.get(subscription.connection_id) || '';
    const integration = integrations.find((integration) => integration.id === subscription.integration_name);
    const trigger_display_name =
      integration?.events?.find((event) => event.id === subscription.trigger_name)?.display_name ||
      subscription.trigger_name;

    return {
      id: subscription.id,
      trigger_name: subscription.trigger_name,
      connection_name,
      trigger_display_name,
      integration_logo: integration?.logo || '',
    };
  });

  // Save to local storage before returning
  const storedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.COMBINED_TRIGGERS);
  let existingData: Record<string, CombinedTriggerType[]> = {};

  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);

      if (parsed && typeof parsed === 'object') {
        existingData = parsed;
      }
    } catch {
      // If parsing fails, start with empty object
    }
  }

  existingData[processId] = result;
  setToLocalStorage(LOCAL_STORAGE_KEYS.COMBINED_TRIGGERS, JSON.stringify(existingData));

  return result;
};

/**
 * Get filtered triggers for a specific connection
 *
 * @param processId - Process ID to key the storage
 * @param connectionName - Connection name to filter by
 * @returns Array of triggers filtered by connection name
 */
export const getFilteredTriggersForConnection = (processId: string, connectionName: string): CombinedTriggerType[] => {
  const storedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.COMBINED_TRIGGERS);
  const combinedTriggers: CombinedTriggerType[] = [];

  if (storedData && processId) {
    try {
      const parsedData = JSON.parse(storedData);
      const processIdKey = processId;

      if (parsedData[processIdKey]) {
        combinedTriggers.push(...parsedData[processIdKey]);
      }
    } catch {
      // If parsing fails, continue to return empty array
    }
  }

  return combinedTriggers.filter((trigger) => trigger.connection_name === connectionName);
};
