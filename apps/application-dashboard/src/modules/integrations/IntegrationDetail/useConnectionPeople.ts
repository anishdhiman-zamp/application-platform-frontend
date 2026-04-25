'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import { useSearchParams } from 'next/navigation';
import {
  useGetAgentsListQuery,
  useLazyGetConnectionToolPoliciesQuery,
  useLazyGetIntegrationToolsQuery,
} from '@/apis/agents';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import {
  useDeleteAudienceFromResourceMutation,
  useLazyGetAudiencesByResourceIdQuery,
  usePatchChangeAudienceRoleInResourceMutation,
} from '@/apis/collaboration';
import { useDeleteIntegrationConnectionMutation } from '@/apis/integrations';
import {
  useEnsureResourceAction,
  useSyncToolPolicies,
} from '@/modules/integrations/IntegrationDetail/useSyncToolPolicies';
import type {
  ConnectionEntryType,
  ConnectionRoleType,
  ConnectionWithPeopleType,
  PersonEntryType,
} from '@/modules/integrations/types/integrations.types';
import {
  applyPoliciesToTools,
  buildConnectionsFromAudiences,
  buildSkeletonConnections,
  deriveAccessLevel,
  indexPeopleByConnectionAndUser,
  mapIntegrationToolsToBaseTools,
} from '@/modules/integrations/utils/integrations.utils';
import {
  ACCESS_LEVEL_OPTIONS,
  PERMISSION_TO_POLICY,
} from '@/modules/pace/components/agents/constants/agents.constants';
import type {
  AccessLevelType,
  AgentToolType,
  ToolPermissionType,
} from '@/modules/pace/components/agents/types/agents.types';
import { ResourceAudienceType } from '@/types/api/auth.types';
import type { AudiencesByResourceResponse } from '@/types/api/collaboration.types';

// Module-level LRU cache so data persists across mount/unmount of the tab without
// growing unbounded as users navigate through many integrations in one session.
const MAX_CACHED_INTEGRATIONS = 10;
const connectionDataCache = new Map<string, ConnectionWithPeopleType[]>();

const setCachedConnections = (integrationName: string, data: ConnectionWithPeopleType[]) => {
  // Re-insert to move the key to the end (Map iteration order = insertion order).
  connectionDataCache.delete(integrationName);
  connectionDataCache.set(integrationName, data);
  while (connectionDataCache.size > MAX_CACHED_INTEGRATIONS) {
    const oldestKey = connectionDataCache.keys().next().value;

    if (oldestKey === undefined) break;
    connectionDataCache.delete(oldestKey);
  }
};

// Pure updaters hoisted out of component handlers to avoid per-render closures.
const updatePersonInConnection = (
  connections: ConnectionWithPeopleType[],
  connectionId: string,
  userId: string,
  updater: (p: PersonEntryType) => PersonEntryType,
): ConnectionWithPeopleType[] =>
  connections.map((c) => {
    if (c.connectionId !== connectionId) return c;

    const apply = (p: PersonEntryType): PersonEntryType => (p.userId !== userId ? p : updater(p));

    return {
      ...c,
      people: c.people.map(apply),
      agents: c.agents.map(apply),
    };
  });

const removePersonFromConnection = (
  connections: ConnectionWithPeopleType[],
  connectionId: string,
  userId: string,
): ConnectionWithPeopleType[] =>
  connections.map((c) =>
    c.connectionId !== connectionId
      ? c
      : {
          ...c,
          people: c.people.filter((p) => p.userId !== userId),
          agents: c.agents.filter((p) => p.userId !== userId),
        },
  );

const applyToolPermissionToPerson =
  (toolId: string, permission: ToolPermissionType) =>
  (p: PersonEntryType): PersonEntryType => {
    const updatedTools = p.tools.map((tool) => (tool.id === toolId ? { ...tool, permission } : tool));

    return {
      ...p,
      tools: updatedTools,
      accessLevel: deriveAccessLevel(updatedTools),
    };
  };

const applyAccessLevelToPerson =
  (accessLevel: AccessLevelType, permission: ToolPermissionType) =>
  (p: PersonEntryType): PersonEntryType => {
    const updatedTools = p.tools.map((tool) => ({ ...tool, permission }));

    return {
      ...p,
      tools: updatedTools,
      accessLevel,
    };
  };

interface UseConnectionPeopleArgs {
  connections: ConnectionEntryType[];
  integrationName: string;
}

export const useConnectionPeople = ({ connections, integrationName }: UseConnectionPeopleArgs) => {
  const searchParams = useSearchParams();
  const initialConnectionId = searchParams?.get('connectionId');

  // state
  const [connectionData, setConnectionData] = useState<ConnectionWithPeopleType[]>(
    () => connectionDataCache.get(integrationName) ?? buildSkeletonConnections(connections),
  );
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(() => new Set());
  const [deletingConnectionIds, setDeletingConnectionIds] = useState<Set<string>>(new Set());

  // derived state
  const { data: agentsData, isError: isAgentsError, refetch: refetchAgents } = useGetAgentsListQuery({ filter: 'all' });
  const agentNameById = useMemo(() => new Map(agentsData?.agents?.map((a) => [a.id, a.name]) ?? []), [agentsData]);

  // hooks (RTK lazy/mutation)
  const [fetchAudiences] = useLazyGetAudiencesByResourceIdQuery();
  const [changeAudienceRole] = usePatchChangeAudienceRoleInResourceMutation();
  const [deleteAudience] = useDeleteAudienceFromResourceMutation();
  const [fetchIntegrationTools] = useLazyGetIntegrationToolsQuery();
  const [deleteIntegrationConnection] = useDeleteIntegrationConnectionMutation();
  const [fetchToolPolicies] = useLazyGetConnectionToolPoliciesQuery();
  const { syncToolPolicies } = useSyncToolPolicies();
  const ensureResourceAction = useEnsureResourceAction();

  // handlers
  const patchPerson = useCallback(
    (connectionId: string, userId: string, updater: (p: PersonEntryType) => PersonEntryType) => {
      setConnectionData((prev) => updatePersonInConnection(prev, connectionId, userId, updater));
    },
    [],
  );

  // Phase 1: fetch integration tools + per-connection audiences in parallel.
  const fetchConnectionsPhase1 = useCallback(async () => {
    const [toolsResult, audiencesByConn] = await Promise.all([
      fetchIntegrationTools({ integrationName })
        .unwrap()
        .catch(() => null),
      Promise.all(
        connections.map((conn) =>
          fetchAudiences({
            apiEndpoint: API_ENDPOINTS.RESOURCE_AUDIENCES_BY_RESOURCE_ID_GET_V2,
            resourceRoute: 'connection',
            resourceId: conn.id,
          })
            .unwrap()
            .then((res): { conn: typeof conn; audiences: AudiencesByResourceResponse[] } => ({
              conn,
              audiences: res ?? [],
            }))
            .catch((): { conn: typeof conn; audiences: AudiencesByResourceResponse[] } => ({
              conn,
              audiences: [],
            })),
        ),
      ),
    ]);

    const toolItems = toolsResult?.items ?? toolsResult?.tools ?? [];
    const baseTools = mapIntegrationToolsToBaseTools(toolItems);

    return { baseTools, audiencesByConn };
  }, [connections, integrationName, fetchAudiences, fetchIntegrationTools]);

  const loadPoliciesForPerson = useCallback(
    (connectionId: string, userId: string, rapId: string, baseTools: AgentToolType[]) => {
      fetchToolPolicies({ connectionId, resourceAudiencePolicyId: rapId })
        .unwrap()
        .then((policiesRes) => {
          patchPerson(connectionId, userId, (p) => {
            const updatedTools = applyPoliciesToTools(baseTools, policiesRes);
            const existingPolicies = (policiesRes?.policies ?? []).map((row) => ({
              id: row.tool_policy_id,
              tool_name: row.tool_name,
              legacyPolicy: row.policy,
            }));

            return {
              ...p,
              tools: updatedTools,
              accessLevel: deriveAccessLevel(updatedTools),
              isLoadingPolicies: false,
              existingPolicies,
            };
          });
        })
        .catch(() => {
          // No policies saved for this person yet — keep defaults but clear loading.
          patchPerson(connectionId, userId, (p) => ({ ...p, isLoadingPolicies: false, existingPolicies: [] }));
        });
    },
    [fetchToolPolicies, patchPerson],
  );

  const loadData = useCallback(() => {
    if (connections.length === 0) {
      setConnectionData([]);

      return;
    }
    // Wait for agents data before partitioning, otherwise agents will be misclassified as people.
    if (!agentsData) return;

    fetchConnectionsPhase1()
      .then(({ baseTools, audiencesByConn }) => {
        const existingPeopleById = indexPeopleByConnectionAndUser(connectionDataCache.get(integrationName));
        const data = buildConnectionsFromAudiences({
          audiencesByConn,
          baseTools,
          agentNameById,
          existingPeopleById,
        });

        setConnectionData(data);

        data.forEach((conn) => {
          [...conn.people, ...conn.agents].forEach((person) => {
            const rapId = person.resourceAudiencePolicyId;

            if (!rapId) return;

            loadPoliciesForPerson(conn.connectionId, person.userId, rapId, baseTools);
          });
        });
      })
      .catch(() => {
        toast.error('Failed to load data');
      });
  }, [connections, integrationName, agentNameById, agentsData, fetchConnectionsPhase1, loadPoliciesForPerson]);

  const handleToggleExpand = useCallback((connectionId: string) => {
    setExpandedConnections((prev) => {
      const next = new Set(prev);

      if (next.has(connectionId)) {
        next.delete(connectionId);
      } else {
        next.add(connectionId);
      }

      return next;
    });
  }, []);

  const handleRoleChange = useCallback(
    (connectionId: string, userId: string, role: ConnectionRoleType) => {
      const conn = connectionData.find((c) => c.connectionId === connectionId);
      const previousPerson =
        conn?.people.find((p) => p.userId === userId) ?? conn?.agents.find((p) => p.userId === userId);

      if (!previousPerson) return;

      setConnectionData((prev) => updatePersonInConnection(prev, connectionId, userId, (p) => ({ ...p, role })));

      return changeAudienceRole({
        apiEndpoint: API_ENDPOINTS.CHANGE_AUDIENCE_ROLE_IN_RESOURCE_PATCH_V2,
        resourceRoute: 'connection',
        resourceId: connectionId,
        body: {
          audience_id: userId,
          role,
          audience_type: ResourceAudienceType.USER,
        },
      })
        .unwrap()
        .then(() => {
          toast.success('Role updated');
        })
        .catch(() => {
          patchPerson(connectionId, userId, () => previousPerson);
          toast.error('Failed to update role');
        });
    },
    [connectionData, changeAudienceRole, patchPerson],
  );

  const handleRemoveAudience = useCallback(
    (connectionId: string, userId: string) => {
      const conn = connectionData.find((c) => c.connectionId === connectionId);
      const person = conn?.people.find((p) => p.userId === userId) ?? conn?.agents.find((p) => p.userId === userId);

      if (!person) return;

      return deleteAudience({
        apiEndpoint: API_ENDPOINTS.DELETE_RESOURCE_FROM_AUDIENCES_V2,
        resourceRoute: 'connection',
        resourceId: connectionId,
        body: {
          audience_id: userId,
          audience_type: ResourceAudienceType.USER,
        },
      })
        .unwrap()
        .then(() => {
          setConnectionData((prev) => removePersonFromConnection(prev, connectionId, userId));
          toast.success(`Removed ${person?.name} from connection`);
        })
        .catch(() => {
          toast.error('Failed to remove access');
        });
    },
    [connectionData, deleteAudience],
  );

  const handleDeleteConnection = useCallback(
    (connectionId: string) => {
      setDeletingConnectionIds((prev) => new Set(prev).add(connectionId));

      return deleteIntegrationConnection({ connectionId })
        .unwrap()
        .then(() => {
          setConnectionData((prev) => prev.filter((c) => c.connectionId !== connectionId));
          toast.success('Connection removed');
        })
        .catch(() => {
          toast.error('Failed to remove connection');
        })
        .finally(() => {
          setDeletingConnectionIds((prev) => {
            const next = new Set(prev);

            next.delete(connectionId);

            return next;
          });
        });
    },
    [deleteIntegrationConnection],
  );

  const sendPolicyUpdate = useCallback(
    (
      connectionId: string,
      userId: string,
      changedPolicies: { tool_name: string; policy: string }[],
      onError?: () => void,
    ) => {
      if (changedPolicies.length === 0) return;

      const conn = connectionData.find((c) => c.connectionId === connectionId);
      const person = conn?.people.find((p) => p.userId === userId) ?? conn?.agents.find((p) => p.userId === userId);

      if (!person?.resourceAudiencePolicyId || !person.audience) return;

      const rapId = person.resourceAudiencePolicyId;

      return ensureResourceAction(connectionId)
        .then((resourceActionId) =>
          syncToolPolicies({
            connectionId,
            resourceActionId,
            shares: [
              {
                rapId,
                audience: person.audience!,
                existingPolicies: person.existingPolicies ?? [],
              },
            ],
            policies: changedPolicies,
          }),
        )
        .then((digestsByRap) => {
          const nextDigest = digestsByRap.get(rapId);

          if (nextDigest) {
            patchPerson(connectionId, userId, (p) => ({ ...p, existingPolicies: nextDigest }));
          }
          toast.success('Tool policies updated');
        })
        .catch(() => {
          onError?.();
          toast.error('Failed to update tool policies');
        });
    },
    [connectionData, ensureResourceAction, syncToolPolicies, patchPerson],
  );

  const handleToolPermissionChange = useCallback(
    (connectionId: string, userId: string, toolId: string, permission: ToolPermissionType) => {
      const conn = connectionData.find((c) => c.connectionId === connectionId);
      const previousPerson =
        conn?.people.find((p) => p.userId === userId) ?? conn?.agents.find((p) => p.userId === userId);

      if (!previousPerson) return;

      setConnectionData((prev) =>
        updatePersonInConnection(prev, connectionId, userId, applyToolPermissionToPerson(toolId, permission)),
      );

      sendPolicyUpdate(connectionId, userId, [{ tool_name: toolId, policy: PERMISSION_TO_POLICY[permission] }], () =>
        patchPerson(connectionId, userId, () => previousPerson),
      );
    },
    [connectionData, sendPolicyUpdate, patchPerson],
  );

  const handleAccessLevelChange = useCallback(
    (connectionId: string, userId: string, accessLevel: AccessLevelType) => {
      const option = ACCESS_LEVEL_OPTIONS.find((opt) => opt.value === accessLevel);

      if (!option?.permission) return;

      const conn = connectionData.find((c) => c.connectionId === connectionId);
      const previousPerson =
        conn?.people.find((p) => p.userId === userId) ?? conn?.agents.find((p) => p.userId === userId);

      if (!previousPerson) return;

      setConnectionData((prev) =>
        updatePersonInConnection(prev, connectionId, userId, applyAccessLevelToPerson(accessLevel, option.permission!)),
      );

      sendPolicyUpdate(
        connectionId,
        userId,
        previousPerson.tools.map((t) => ({
          tool_name: t.id,
          policy: PERMISSION_TO_POLICY[option.permission!],
        })),
        () => patchPerson(connectionId, userId, () => previousPerson),
      );
    },
    [connectionData, sendPolicyUpdate, patchPerson],
  );

  const handleShared = useCallback(() => {
    refetchAgents();
    loadData();
  }, [refetchAgents, loadData]);

  const expandDefaultConnection = useCallback(() => {
    const matchedInitial =
      initialConnectionId && connections.some((c) => c.id === initialConnectionId) ? initialConnectionId : undefined;
    const defaultId = matchedInitial ?? connections[0]?.id;

    if (!defaultId) return;
    setExpandedConnections((prev) => (prev.size > 0 ? prev : new Set([defaultId])));
  }, [initialConnectionId, connections]);

  // effects
  useEffect(() => {
    setCachedConnections(integrationName, connectionData);
  }, [integrationName, connectionData]);

  // Expand the default connection on mount so AnimatePresence animates open.
  useEffect(() => {
    expandDefaultConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isAgentsError) toast.error('Failed to load agents');
  }, [isAgentsError]);

  return {
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
  };
};
