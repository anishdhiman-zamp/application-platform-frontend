/**
 * Custom hook for ConnectionList component logic
 * Handles connection selection and connection action
 */

import { useCallback, useEffect, useState } from 'react';
import { ConnectionType } from '@/types/api/integrations';

interface UseConnectionListProps {
  connections: ConnectionType[];
  onConnect: (selectedConnection: ConnectionType) => void;
}

export const useConnectionList = ({ connections, onConnect }: UseConnectionListProps) => {
  const [selectedConnection, setSelectedConnection] = useState<ConnectionType>();

  // Update selected connection when connections change
  useEffect(() => {
    if (connections.length > 0) {
      setSelectedConnection(connections[0]);
    }
  }, [connections]);

  const handleConnectionChange = useCallback(
    (connectionId: string) => {
      const connection = connections.find((conn) => conn.id === connectionId);

      if (connection) {
        setSelectedConnection(connection);
      }
    },
    [connections],
  );

  const handleConnect = useCallback(() => {
    if (!selectedConnection) return;
    onConnect(selectedConnection);
  }, [selectedConnection, onConnect]);

  return {
    selectedConnection,
    handleConnectionChange,
    handleConnect,
  };
};
