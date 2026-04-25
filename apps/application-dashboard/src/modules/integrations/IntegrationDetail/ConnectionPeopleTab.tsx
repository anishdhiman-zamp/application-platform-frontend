'use client';

import { useCallback, useMemo } from 'react';
import ConnectionPeopleSection from '@/modules/integrations/IntegrationDetail/ConnectionPeopleSection';
import { useConnectionPeople } from '@/modules/integrations/IntegrationDetail/useConnectionPeople';
import type { ConnectionPeopleTabPropsType, ConnectionRoleType } from '@/modules/integrations/types/integrations.types';
import type { AccessLevelType, ToolPermissionType } from '@/modules/pace/components/agents/types/agents.types';

const ConnectionPeopleTab = ({ connections, integrationName, integrationLogo }: ConnectionPeopleTabPropsType) => {
  // hooks
  const {
    connectionData,
    expandedConnections,
    deletingConnectionIds,
    handleToggleExpand,
    handleToolPermissionChange,
    handleAccessLevelChange,
    handleRoleChange,
    handleRemoveAudience,
    handleDeleteConnection,
    handleShared,
  } = useConnectionPeople({ connections, integrationName });

  // handlers: Section expects (userId, …) so bind connectionId once via a
  // memoized factory instead of recreating inline lambdas on every render.
  const createSectionHandlers = useCallback(
    (connectionId: string) => ({
      onToggle: () => handleToggleExpand(connectionId),
      onToolPermissionChange: (userId: string, toolId: string, permission: ToolPermissionType) =>
        handleToolPermissionChange(connectionId, userId, toolId, permission),
      onAccessLevelChange: (userId: string, accessLevel: AccessLevelType) =>
        handleAccessLevelChange(connectionId, userId, accessLevel),
      onRoleChange: (userId: string, role: ConnectionRoleType) => handleRoleChange(connectionId, userId, role),
      onRemoveAudience: (userId: string) => handleRemoveAudience(connectionId, userId),
    }),
    [handleToggleExpand, handleToolPermissionChange, handleAccessLevelChange, handleRoleChange, handleRemoveAudience],
  );

  const sectionHandlersById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof createSectionHandlers>>();

    connectionData.forEach((conn) => map.set(conn.connectionId, createSectionHandlers(conn.connectionId)));

    return map;
  }, [connectionData, createSectionHandlers]);

  // render
  if (connectionData.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-y-2 py-12'>
        <span className='f-13-450 text-GRAY_700'>No people have access to this integration&apos;s connections</span>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-y-2'>
      {connectionData.map((conn) => {
        const handlers = sectionHandlersById.get(conn.connectionId);

        if (!handlers) return null;

        return (
          <ConnectionPeopleSection
            key={conn.connectionId}
            connection={conn}
            integrationName={integrationName}
            integrationLogo={integrationLogo}
            isExpanded={expandedConnections.has(conn.connectionId)}
            onToggle={handlers.onToggle}
            onToolPermissionChange={handlers.onToolPermissionChange}
            onAccessLevelChange={handlers.onAccessLevelChange}
            onRoleChange={handlers.onRoleChange}
            onRemoveAudience={handlers.onRemoveAudience}
            onDelete={handleDeleteConnection}
            onShared={handleShared}
            isDeleting={deletingConnectionIds.has(conn.connectionId)}
          />
        );
      })}
    </div>
  );
};

export default ConnectionPeopleTab;
