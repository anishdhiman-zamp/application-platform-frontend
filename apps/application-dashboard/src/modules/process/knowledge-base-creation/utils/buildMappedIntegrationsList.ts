import { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { ConnectionType, GetProcessConnectionMappingsResponseType } from '@/types/api/integrations';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

export interface MappedIntegrationType {
  integration: IntegrationType;
  number_of_connections: number;
  connections: ConnectionType[];
}

export const buildMappedIntegrationsList = (
  processId: string,
  integrations: IntegrationType[] | undefined,
  processConnectionMappings: GetProcessConnectionMappingsResponseType | undefined,
): MappedIntegrationType[] => {
  if (!processConnectionMappings || !integrations || !integrations.length) {
    // Check local storage before returning empty array
    const storedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.MAPPED_INTEGRATIONS_LIST);

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

  // Create a map to store connections per integration_name
  const integrationConnectionsMap: Record<string, ConnectionType[]> = {};

  // Collect connection names for each integration_name
  processConnectionMappings.mappings.forEach((mapping) => {
    const integrationName = mapping.connection.integration_name;

    if (integrationName) {
      const connection = mapping.connection;

      if (connection) {
        if (!integrationConnectionsMap[integrationName]) {
          integrationConnectionsMap[integrationName] = [];
        }
        integrationConnectionsMap[integrationName].push(connection);
      }
    }
  });

  // Build the result array by matching integration_name with integration.id
  const result = Object.entries(integrationConnectionsMap).map(([integration_name, connections]) => {
    // Find the matching integration by id
    const integration = integrations.find((int) => int.id === integration_name);

    if (!integration) {
      return null;
    }

    return {
      integration,
      number_of_connections: connections?.length || 0,
      connections: connections,
    };
  });

  // Save to local storage before returning
  const storedData = getFromLocalStorage(LOCAL_STORAGE_KEYS.MAPPED_INTEGRATIONS_LIST);
  const existingData = storedData ? JSON.parse(storedData) : {};

  existingData[processId] = result;
  setToLocalStorage(LOCAL_STORAGE_KEYS.MAPPED_INTEGRATIONS_LIST, JSON.stringify(existingData));

  return result.filter((mappedIntegration) => mappedIntegration !== null);
};
