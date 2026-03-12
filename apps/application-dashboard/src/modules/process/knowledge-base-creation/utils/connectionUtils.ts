/**
 * Utility functions for connection operations
 */

import { ConnectionType } from '@/types/api/integrations';

/**
 * Get connections that are available to add (not already mapped)
 *
 * @param allConnections - All available connections
 * @param mappedConnections - Connections that are already mapped
 * @returns Array of connections that are not yet mapped
 */
export const getAvailableConnections = (
  allConnections: ConnectionType[],
  mappedConnections: ConnectionType[],
): ConnectionType[] => {
  return allConnections?.filter(
    (connection) => !mappedConnections.some((mappedConnection) => mappedConnection.name === connection.name),
  );
};

/**
 * Check if a connection is already mapped
 *
 * @param connectionId - Connection ID to check
 * @param mappedConnections - Array of mapped connections
 * @returns True if connection is already mapped, false otherwise
 */
export const isConnectionMapped = (connectionId: string, mappedConnections: ConnectionType[]): boolean => {
  return mappedConnections.some((mapping) => mapping.id === connectionId);
};

/**
 * Create a temporary ConnectionType object with minimal required fields
 * Used when creating a connection mapping from a connection ID
 *
 * @param connectionId - The connection ID
 * @param integrationName - Optional integration name (defaults to empty string)
 * @returns A ConnectionType object with the provided connectionId and integrationName
 */
export const createTempConnection = (connectionId: string, integrationName = ''): ConnectionType => {
  return {
    id: connectionId,
    connector_id: '',
    organization_id: '',
    name: '',
    status: '',
    created_at: '',
    updated_at: '',
    integration_name: integrationName,
  };
};
