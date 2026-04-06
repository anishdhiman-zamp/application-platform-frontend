'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Skeleton, toast } from '@zamp-platform/ui';
import IntegrationDetail from 'modules/pace/components/agents/components/IntegrationDetail';
import IntegrationList from 'modules/pace/components/agents/components/IntegrationList';
import {
  ACCESS_LEVEL_OPTIONS,
  PERMISSION_TO_POLICY,
  POLICY_TO_PERMISSION,
} from 'modules/pace/components/agents/constants/agents.constants';
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
  useUpdateConnectionToolPoliciesMutation,
} from '@/apis/agents';
import { useGetIntegrationsCatalogEnabledQuery } from '@/apis/integrations';
import CommonWrapper from '@/components/commonWrapper';

interface AgentToolsAccessProps {
  agentId: string;
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

const AgentToolsAccess = ({ agentId, isActive = true, skipFetch = false, onAddConnection }: AgentToolsAccessProps) => {
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
  const [updateToolPolicies] = useUpdateConnectionToolPoliciesMutation();

  const [integrations, setIntegrations] = useState<AgentIntegrationType[]>([]);
  const [allIntegrations, setAllIntegrations] = useState<AgentIntegrationType[]>([]);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('');
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [removingIntegrationId, setRemovingIntegrationId] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);

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
    async (connectionId: string, tools: { id: string; permission: ToolPermissionType }[]) => {
      const rapId = rapIdMap.get(connectionId);

      try {
        await updateToolPolicies({
          connectionId,
          resourceAudiencePolicyId: rapId,
          policies: tools.map((t) => ({ tool_name: t?.id, policy: PERMISSION_TO_POLICY[t?.permission] })),
        }).unwrap();

        toast.success('Tool policies updated');

        // Re-fetch to sync with server state
        fetchToolPolicies({ connectionId });
      } catch {
        toast.error('Failed to update tool policies');
      }
    },
    [rapIdMap, updateToolPolicies, fetchToolPolicies],
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
    async (integrationId: string) => {
      const integration = integrations.find((i) => i?.id === integrationId);

      if (!integration) return;

      setRemovingIntegrationId(integrationId);

      try {
        await deleteAgentIntegration({ agentId, integrationName: integrationId }).unwrap();

        toast.success(`${integration?.name} removed`);

        setIntegrations((prev) => {
          const updated = prev.filter((i) => i?.id !== integrationId);

          if (selectedIntegrationId === integrationId) {
            setSelectedIntegrationId(updated[0]?.id ?? '');
          }

          return updated;
        });
      } catch {
        toast.error(`Failed to remove ${integration?.name}`);
      } finally {
        setRemovingIntegrationId(null);
      }
    },
    [agentId, integrations, selectedIntegrationId, deleteAgentIntegration],
  );

  const handleToggleConnectionEnabled = useCallback(
    async (integrationId: string, connectionId: string, checked: boolean) => {
      if (checked) {
        // Add connection to agent
        try {
          await addConnection({ connectionId, agentId }).unwrap();

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
        } catch {
          toast.error('Failed to add connection');
        }
      } else {
        // Remove connection from agent
        try {
          await removeConnection({ connectionId, agentId }).unwrap();

          setIntegrations((prev) =>
            prev.map((integration) => ({
              ...integration,
              connections: integration?.connections.filter((c) => c?.id !== connectionId),
            })),
          );
          toast.success('Connection removed');
        } catch {
          toast.error('Failed to remove connection');
        }
      }
    },
    [agentId, addConnection, removeConnection, allIntegrations],
  );

  const handleRemoveConnection = useCallback(
    async (connectionId: string) => {
      try {
        await removeConnection({ connectionId, agentId }).unwrap();

        setIntegrations((prev) =>
          prev
            .map((integration) => ({
              ...integration,
              connections: integration?.connections.filter((c) => c?.id !== connectionId),
            }))
            .filter((integration) => integration.connections.length > 0),
        );
        toast.success('Connection removed');
      } catch {
        toast.error('Failed to remove connection');
      }
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

      return;
    }

    if (isInitialLoadRef.current) {
      setIsLoadingTools(true);
    }

    const fetchAll = async () => {
      // Fetch tools for each integration
      const toolsMap = new Map<string, AgentToolType[]>();

      await Promise.all(
        withConnections.map(async (item) => {
          try {
            const result = await fetchIntegrationTools({ integrationName: item.name }).unwrap();
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
          } catch {
            toolsMap.set(item?.name, []);
          }
        }),
      );

      // Fetch existing tool policies for each connection
      const policyMap = new Map<string, Map<string, ToolPermissionType>>();
      const allConnectionIds = withConnections.flatMap((item) =>
        (item?.connections ?? []).map((c) => c?.id).filter((id): id is string => Boolean(id)),
      );

      await Promise.all(
        allConnectionIds.map(async (connectionId) => {
          try {
            const policiesRes = await fetchToolPolicies({ connectionId }).unwrap();
            const map = new Map<string, ToolPermissionType>();

            policiesRes?.policies?.forEach((p) => {
              const permission = POLICY_TO_PERMISSION[p?.policy];

              if (permission) {
                map.set(p?.tool_name, permission);
              }
            });
            policyMap.set(connectionId, map);
          } catch {
            // No policies saved yet — use defaults
          }
        }),
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
    };

    fetchAll();
  }, [catalogData, agentConnectionsData, fetchIntegrationTools, fetchToolPolicies]);

  if (isCatalogError || isConnectionsError) {
    const handleRefetch = () => {
      if (isCatalogError) refetchCatalog();
      if (isConnectionsError) refetchConnections();
    };

    return (
      <CommonWrapper isError refetchFunction={handleRefetch} className='flex min-h-0 flex-1 flex-col'>
        {null}
      </CommonWrapper>
    );
  }

  if (isLoadingCatalog || isLoadingAgentConnections || isLoadingTools || isInitialLoadRef.current) {
    return (
      <div className='bg-BG_GRAY_2 flex h-full rounded-xl'>
        <div className='flex flex-2 flex-col gap-1 p-1.5'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center gap-2 rounded-md p-1.5'>
              <Skeleton className='size-4 rounded-[2.5px]' />
              <Skeleton className='h-4 w-24' />
              <div className='ml-auto flex items-center gap-1'>
                <Skeleton className='size-5 rounded' />
                <Skeleton className='size-5 rounded' />
                <Skeleton className='size-5 rounded' />
              </div>
            </div>
          ))}
        </div>
        <div className='border-GRAY_200 flex flex-5 flex-col border-l p-4'>
          <div className='mb-4 flex items-center gap-2'>
            <Skeleton className='size-5 rounded-[2.5px]' />
            <Skeleton className='h-5 w-28' />
          </div>
          <div className='bg-GRAY_50 flex flex-col gap-3 rounded-lg p-4'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-4 w-4 rounded' />
              <Skeleton className='h-4 w-40' />
              <Skeleton className='ml-auto h-4 w-20' />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between py-1'>
                <Skeleton className='h-4 w-36' />
                <div className='flex gap-1.5'>
                  <Skeleton className='size-5 rounded-full' />
                  <Skeleton className='size-5 rounded-full' />
                  <Skeleton className='size-5 rounded-full' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className='border-GRAY_400 flex h-full items-center justify-center rounded-xl border'>
        <p className='f-13-450 text-GRAY_700'>No integrations configured</p>
      </div>
    );
  }

  return (
    <>
      <p className='text-GRAY_700 f-14-450 mb-4 ml-2.5 shrink-0'>
        What can the agent use? Add connections & tools it can access.
      </p>

      <div className='bg-BG_GRAY_2 flex h-full rounded-xl'>
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
