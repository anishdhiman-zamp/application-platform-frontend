'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import AgentTabEmptyState from 'modules/pace/components/agents/components/AgentTabEmptyState';
import IntegrationDetail from 'modules/pace/components/agents/components/IntegrationDetail';
import IntegrationList from 'modules/pace/components/agents/components/IntegrationList';
import {
  ACCESS_LEVEL_OPTIONS,
  PERMISSION_TO_POLICY,
  POLICY_TO_PERMISSION,
} from 'modules/pace/components/agents/constants/agents.constants';
import ToolsAccessSkeleton from 'modules/pace/components/agents/skeletons/ToolsAccessSkeleton';
import {
  ACCESS_LEVEL,
  type AccessLevelType,
  type AgentIntegrationType,
  type AgentToolType,
  TOOL_PERMISSION,
  type ToolPermissionType,
} from 'modules/pace/components/agents/types/agents.types';
import {
  useAddConnectionToAgentMutation,
  useDeleteAgentIntegrationMutation,
  useGetAgentConnectionsQuery,
  useLazyGetConnectionToolPoliciesQuery,
  useLazyGetIntegrationToolsQuery,
  useRemoveConnectionFromAgentMutation,
} from '@/apis/agents';
import { useGetIntegrationsCatalogEnabledQuery } from '@/apis/integrations';
import CommonWrapper from '@/components/commonWrapper';
import {
  useEnsureResourceAction,
  useSyncToolPolicies,
} from '@/modules/integrations/IntegrationDetail/useSyncToolPolicies';

interface AgentToolsAccessProps {
  agentId: string;
  agentAvatarSrc?: string;
  isActive?: boolean;
  skipFetch?: boolean;
  onAddConnection?: () => void;
}

const deriveAccessLevel = (tools?: { permission: ToolPermissionType }[]): AccessLevelType => {
  if (!tools?.length) return ACCESS_LEVEL.CUSTOM;

  const first = tools[0]!.permission;
  const allSame = tools.every((t) => t?.permission === first);

  if (!allSame) return ACCESS_LEVEL.CUSTOM;

  return ACCESS_LEVEL_OPTIONS.find((opt) => opt?.permission === first)?.value ?? ACCESS_LEVEL.CUSTOM;
};

const AgentToolsAccess = ({
  agentId,
  agentAvatarSrc,
  isActive = true,
  skipFetch = false,
  onAddConnection,
}: AgentToolsAccessProps) => {
  const isInitialLoadRef = useRef(true);
  const isFetchingToolsRef = useRef(false);
  const hasBeenActiveRef = useRef(isActive);

  const isFirstVisit = !hasBeenActiveRef.current && isActive;

  if (isActive) hasBeenActiveRef.current = true;
  const shouldSkip = !hasBeenActiveRef.current || skipFetch;

  const {
    data: catalogData,
    isLoading: isLoadingCatalog,
    isError: isCatalogError,
    refetch: refetchCatalog,
  } = useGetIntegrationsCatalogEnabledQuery({ page_size: 100 }, { skip: shouldSkip });
  const [fetchIntegrationTools] = useLazyGetIntegrationToolsQuery();
  const [fetchToolPolicies] = useLazyGetConnectionToolPoliciesQuery();
  const {
    data: agentConnectionsData,
    isLoading: isLoadingAgentConnections,
    isError: isConnectionsError,
    refetch: refetchConnections,
  } = useGetAgentConnectionsQuery({ agentId }, { skip: shouldSkip });

  const [addConnection] = useAddConnectionToAgentMutation();
  const [removeConnection] = useRemoveConnectionFromAgentMutation();
  const [deleteAgentIntegration] = useDeleteAgentIntegrationMutation();
  const { syncToolPolicies } = useSyncToolPolicies();
  const ensureResourceAction = useEnsureResourceAction();

  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [integrations, setIntegrations] = useState<AgentIntegrationType[]>([]);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('');
  const [allIntegrations, setAllIntegrations] = useState<AgentIntegrationType[]>([]);
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());
  const [removingIntegrationId, setRemovingIntegrationId] = useState<string | null>(null);
  // Per-connection digest overrides updated after each successful save so the
  // next diff sees the latest server state without a refetch.
  const [digestOverrides, setDigestOverrides] = useState<
    Map<string, { id: string; tool_name: string; legacyPolicy: string }[]>
  >(new Map());

  const isInitialToolsAccessLoading =
    shouldSkip ||
    !hasInitiallyLoaded ||
    ((isLoadingCatalog || isLoadingAgentConnections || isLoadingTools) && integrations.length === 0);

  // Map connectionId → resourceAudiencePolicyId from agent connections
  const rapIdMap = useMemo(() => {
    const map = new Map<string, string>();

    agentConnectionsData?.connections?.forEach((c) => {
      if (c?.id && c.resource_audience_policy_id) {
        map.set(c?.id, c?.resource_audience_policy_id);
      }
    });

    return map;
  }, [agentConnectionsData]);

  // Map connectionId → existing policy digests (id, tool_name, legacyPolicy).
  // Server snapshot from agent connections, with local overrides applied so
  // the digest stays current after each successful save without a refetch.
  const existingPoliciesByConnection = useMemo(() => {
    const map = new Map<string, { id: string; tool_name: string; legacyPolicy: string }[]>();

    agentConnectionsData?.connections?.forEach((c) => {
      if (!c?.id) return;
      map.set(
        c.id,
        (c.tool_policies ?? []).map((p) => ({
          id: p.tool_policy_id,
          tool_name: p.tool_name,
          legacyPolicy: p.policy,
        })),
      );
    });
    digestOverrides.forEach((digest, connectionId) => map.set(connectionId, digest));

    return map;
  }, [agentConnectionsData, digestOverrides]);

  const selectedIntegration = useMemo(
    () => integrations.find((i) => i?.id === selectedIntegrationId),
    [integrations, selectedIntegrationId],
  );

  const handleToggleConnection = useCallback((connectionId: string) => {
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

  const handleSelectIntegration = useCallback(
    (integrationId: string) => {
      setSelectedIntegrationId(integrationId);
      const integration = integrations.find((i) => i?.id === integrationId);
      const firstConnectionId = integration?.connections?.[0]?.id;

      setExpandedConnections(firstConnectionId ? new Set([firstConnectionId]) : new Set());
    },
    [integrations],
  );

  const buildToolPolicies = useCallback(
    (connectionId: string, tools: { id: string; permission: ToolPermissionType }[]) => {
      const rapId = rapIdMap.get(connectionId);

      if (!rapId) return;

      const policies = tools.map((t) => ({ tool_name: t?.id, policy: PERMISSION_TO_POLICY[t?.permission] }));

      return ensureResourceAction(connectionId)
        .then((resourceActionId) =>
          syncToolPolicies({
            connectionId,
            resourceActionId,
            shares: [
              {
                rapId,
                audience: { type: 'user', id: agentId },
                existingPolicies: existingPoliciesByConnection.get(connectionId) ?? [],
              },
            ],
            policies,
          }),
        )
        .then((digestsByRap) => {
          const nextDigest = digestsByRap.get(rapId);

          if (nextDigest) {
            setDigestOverrides((prev) => {
              const next = new Map(prev);

              next.set(connectionId, nextDigest);

              return next;
            });
          }
          toast.success('Tool policies updated');
        })
        .catch(() => {
          toast.error('Failed to update tool policies');
        });
    },
    [agentId, rapIdMap, existingPoliciesByConnection, ensureResourceAction, syncToolPolicies],
  );

  const handleToolPermissionChange = useCallback(
    (connectionId: string, toolId: string, permission: ToolPermissionType) => {
      // Compute updated tools from current state before setting
      const connection = integrations.flatMap((i) => i?.connections).find((c) => c?.id === connectionId);

      if (!connection) return;

      const updatedTools = connection?.tools.map((tool) => (tool?.id === toolId ? { ...tool, permission } : tool));

      setIntegrations((prev) =>
        prev.map((integration) => ({
          ...integration,
          connections: integration.connections.map((conn) =>
            conn.id === connectionId
              ? { ...conn, tools: updatedTools, accessLevel: deriveAccessLevel(updatedTools) }
              : conn,
          ),
        })),
      );

      buildToolPolicies(connectionId, updatedTools);
    },
    [integrations, buildToolPolicies],
  );

  const handleAccessLevelChange = useCallback(
    (connectionId: string, accessLevel: AccessLevelType) => {
      const option = ACCESS_LEVEL_OPTIONS.find((opt) => opt.value === accessLevel);

      if (!option?.permission) return;

      const connection = integrations.flatMap((i) => i?.connections).find((c) => c?.id === connectionId);

      if (!connection) return;

      const updatedTools = connection?.tools.map((tool) => ({ ...tool, permission: option.permission! }));

      setIntegrations((prev) =>
        prev.map((integration) => ({
          ...integration,
          connections: integration?.connections.map((conn) =>
            conn.id === connectionId ? { ...conn, accessLevel, tools: updatedTools } : conn,
          ),
        })),
      );

      buildToolPolicies(connectionId, updatedTools);
    },
    [integrations, buildToolPolicies],
  );

  const handleRemoveIntegration = useCallback(
    (integrationId: string) => {
      const integration = integrations.find((i) => i?.id === integrationId);

      if (!integration) return;

      setRemovingIntegrationId(integrationId);

      return deleteAgentIntegration({ agentId, integrationName: integrationId })
        .unwrap()
        .then(() => {
          toast.success(`${integration?.name} removed`);

          setIntegrations((prev) => {
            const updated = prev.filter((i) => i?.id !== integrationId);

            if (selectedIntegrationId === integrationId) {
              setSelectedIntegrationId(updated[0]?.id ?? '');
            }

            return updated;
          });
        })
        .catch(() => {
          toast.error(`Failed to remove ${integration?.name}`);
        })
        .finally(() => {
          setRemovingIntegrationId(null);
        });
    },
    [agentId, integrations, selectedIntegrationId, deleteAgentIntegration],
  );

  const handleToggleConnectionEnabled = useCallback(
    (integrationId: string, connectionId: string, checked: boolean) => {
      if (checked) {
        // Add connection to agent
        return addConnection({ connectionId, agentId })
          .unwrap()
          .then(() => {
            // Re-add the connection to the right panel from allIntegrations
            const fullIntegration = allIntegrations.find((i) => i?.id === integrationId);
            const conn = fullIntegration?.connections.find((c) => c.id === connectionId);

            if (conn) {
              setIntegrations((prev) =>
                prev.map((integration) =>
                  integration.id === integrationId
                    ? { ...integration, connections: [...integration.connections, conn] }
                    : integration,
                ),
              );
            }

            toast.success('Connection added');
          })
          .catch(() => {
            toast.error('Failed to add connection');
          });
      } else {
        // Remove connection from agent
        return removeConnection({ connectionId, agentId })
          .unwrap()
          .then(() => {
            setIntegrations((prev) =>
              prev.map((integration) => ({
                ...integration,
                connections: integration?.connections.filter((c) => c?.id !== connectionId),
              })),
            );
            toast.success('Connection removed');
          })
          .catch(() => {
            toast.error('Failed to remove connection');
          });
      }
    },
    [agentId, addConnection, removeConnection, allIntegrations],
  );

  const handleRemoveConnection = useCallback(
    (connectionId: string) => {
      return removeConnection({ connectionId, agentId })
        .unwrap()
        .then(() => {
          setIntegrations((prev) =>
            prev
              .map((integration) => ({
                ...integration,
                connections: integration?.connections.filter((c) => c?.id !== connectionId),
              }))
              .filter((integration) => integration.connections.length > 0),
          );
          toast.success('Connection removed');
        })
        .catch(() => {
          toast.error('Failed to remove connection');
        });
    },
    [agentId, removeConnection],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps -- isFirstVisit reads a ref; refetch fns are stable RTK identities
  useEffect(() => {
    if (isActive && !isFirstVisit && !skipFetch) {
      refetchCatalog();
      refetchConnections();
    }
  }, [isActive, skipFetch]);

  // Build integrations from agent connections + enabled catalog
  useEffect(() => {
    const items = catalogData?.items;

    if (!items?.length || !agentConnectionsData) {
      if (!isInitialLoadRef.current) {
        setIntegrations([]);
      }

      // Only mark as loaded when queries actually resolved (not when skipped with no data)
      if (!isLoadingCatalog && !isLoadingAgentConnections && !shouldSkip) {
        setIsLoadingTools(false);
        isInitialLoadRef.current = false;
        setHasInitiallyLoaded(true);
      }

      return;
    }

    // Get unique integration names and connection IDs that this agent has access to
    const agentIntegrationNames = new Set(agentConnectionsData.connections?.map((c) => c.integration_name) ?? []);
    const agentConnectionIds = new Set(agentConnectionsData.connections?.map((c) => c.id) ?? []);

    // Filter catalog to only integrations the agent has access to, keeping all their connections
    const withConnections = items.filter(
      (item) => agentIntegrationNames.has(item?.name) && item?.connections?.length > 0,
    );

    if (withConnections.length === 0) {
      setIntegrations([]);
      setIsLoadingTools(false);
      isInitialLoadRef.current = false;
      setHasInitiallyLoaded(true);

      return;
    }

    if (isFetchingToolsRef.current) return;

    setIsLoadingTools(true);
    isFetchingToolsRef.current = true;

    const fetchAll = async () => {
      // Fetch tools for each integration
      const toolsMap = new Map<string, AgentToolType[]>();

      await Promise.all(
        withConnections.map((item) =>
          fetchIntegrationTools({ integrationName: item.name })
            .unwrap()
            .then((result) => {
              const toolItems = result?.items ?? result?.tools ?? [];

              if (toolItems.length > 0) {
                toolsMap.set(
                  item?.name,
                  toolItems.map((t) => ({
                    id: t?.name,
                    name: t?.display_name || t?.name,
                    permission: TOOL_PERMISSION.ALLOWED,
                  })),
                );
              } else {
                toolsMap.set(item?.name, []);
              }
            })
            .catch(() => {
              toolsMap.set(item?.name, []);
            }),
        ),
      );

      // Fetch existing tool policies for each connection
      const policyMap = new Map<string, Map<string, ToolPermissionType>>();
      const allConnectionIds = withConnections.flatMap((item) =>
        (item?.connections ?? []).map((c) => c?.id).filter((id): id is string => Boolean(id)),
      );

      await Promise.all(
        allConnectionIds.map((connectionId) =>
          fetchToolPolicies({ connectionId })
            .unwrap()
            .then((policiesRes) => {
              const map = new Map<string, ToolPermissionType>();

              policiesRes?.policies?.forEach((p) => {
                const permission = POLICY_TO_PERMISSION[p?.policy];

                if (permission) {
                  map.set(p?.tool_name, permission);
                }
              });
              policyMap.set(connectionId, map);
            })
            .catch(() => {
              // No policies saved yet — use defaults
            }),
        ),
      );

      // Helper to build integration UI model from catalog items
      const buildIntegration = (item: (typeof items)[number]) => {
        const tools = toolsMap.get(item?.name) ?? [];

        return {
          id: item?.name,
          name: item?.title || item?.name,
          icon: item?.title?.toLowerCase() || item?.name.replace(/^composio__?/, '').toLowerCase(),
          logo: item?.icon,
          connections: (item.connections ?? []).map((c) => {
            const connPolicies = policyMap.get(c?.id ?? '');
            const connTools = tools.map((tool) => ({
              ...tool,
              permission: connPolicies?.get(tool?.id) ?? tool?.permission,
            }));

            return {
              id: c?.id ?? '',
              email: c?.name || c?.id || '',
              accessLevel: deriveAccessLevel(connTools),
              tools: connTools,
              integrationName: item?.name,
              enabled: true,
            };
          }),
        };
      };

      // Agent-scoped integrations (shown in left panel) — only include connections the agent has access to
      const result: AgentIntegrationType[] = withConnections
        .map((item) => {
          const integration = buildIntegration(item);

          return {
            ...integration,
            connections: integration?.connections?.filter((c) => agentConnectionIds.has(c?.id)),
          };
        })
        .filter((integration) => integration?.connections?.length > 0);

      // All integrations with connections (for the add-connection dropdown)
      const allWithConnections = items.filter((item) => item?.connections?.length > 0);
      const allResult: AgentIntegrationType[] = allWithConnections.map(buildIntegration);

      setIntegrations(result);
      setAllIntegrations(allResult);

      if (result.length > 0 && !selectedIntegrationId) {
        setSelectedIntegrationId(result[0]!.id);
        const firstConnId = result[0]!.connections?.[0]?.id;

        if (firstConnId) {
          setExpandedConnections(new Set([firstConnId]));
        }
      }

      setIsLoadingTools(false);
      isInitialLoadRef.current = false;
      isFetchingToolsRef.current = false;
      setHasInitiallyLoaded(true);
    };

    fetchAll();
  }, [
    catalogData,
    agentConnectionsData,
    fetchIntegrationTools,
    fetchToolPolicies,
    shouldSkip,
    isLoadingCatalog,
    isLoadingAgentConnections,
  ]);

  if (isCatalogError || isConnectionsError) {
    const handleRefetch = () => {
      if (isCatalogError) refetchCatalog();
      if (isConnectionsError) refetchConnections();
    };

    return (
      <CommonWrapper isError refetchFunction={handleRefetch} className='flex flex-col'>
        {null}
      </CommonWrapper>
    );
  }

  if (isInitialToolsAccessLoading) {
    return <ToolsAccessSkeleton />;
  }

  if (integrations.length === 0 && hasInitiallyLoaded) {
    return (
      <AgentTabEmptyState
        agentAvatarSrc={agentAvatarSrc}
        description='Explicitly grant connections access to your agent'
        actionLabel='Add connection'
        onAction={onAddConnection}
      />
    );
  }

  return (
    <>
      <p className='text-GRAY_700 f-14-450 mb-4 ml-2.5'>
        What can the agent use? Add connections & tools it can access.
      </p>

      <div className='bg-BG_GRAY_2 flex rounded-xl'>
        <IntegrationList
          integrations={integrations}
          allIntegrations={allIntegrations}
          selectedIntegrationId={selectedIntegrationId}
          onSelectIntegration={handleSelectIntegration}
          onRemoveIntegration={handleRemoveIntegration}
          removingIntegrationId={removingIntegrationId}
          onToggleConnection={handleToggleConnectionEnabled}
          onAddConnection={onAddConnection}
        />

        {selectedIntegration && (
          <IntegrationDetail
            integration={selectedIntegration}
            allConnections={allIntegrations.find((i) => i.id === selectedIntegration.id)?.connections}
            expandedConnections={expandedConnections}
            onToggleConnection={handleToggleConnection}
            onToolPermissionChange={handleToolPermissionChange}
            onAccessLevelChange={handleAccessLevelChange}
            onRemoveConnection={handleRemoveConnection}
            onRemoveIntegration={handleRemoveIntegration}
            onToggleConnectionEnabled={(connId, checked) =>
              handleToggleConnectionEnabled(selectedIntegration.id, connId, checked)
            }
          />
        )}
      </div>
    </>
  );
};

export default AgentToolsAccess;
