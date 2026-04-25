import {
  CONNECTION_ROLE,
  type ConnectionEntryType,
  type ConnectionWithPeopleType,
  type IntegrationType,
  type PersonEntryType,
} from '@/modules/integrations/types/integrations.types';
import type { ActionAudienceKind } from '@/modules/integrations/types/policies.types';
import {
  ACCESS_LEVEL_OPTIONS,
  POLICY_TO_PERMISSION,
} from '@/modules/pace/components/agents/constants/agents.constants';
import {
  ACCESS_LEVEL,
  type AccessLevelType,
  type AgentToolType,
  TOOL_PERMISSION,
  type ToolPermissionType,
  type ToolPoliciesApiResponse,
} from '@/modules/pace/components/agents/types/agents.types';
import { ResourceAudienceType } from '@/types/api/auth.types';
import type { AudiencesByResourceResponse } from '@/types/api/collaboration.types';

/**
 * Filter integrations by search query
 * This runs on the server for SSR
 */
export const filterIntegrations = (integrations: IntegrationType[], searchQuery: string): IntegrationType[] => {
  if (!searchQuery.trim()) {
    return integrations;
  }

  const query = searchQuery.toLowerCase();

  return integrations.filter(
    (integration) =>
      integration.display_name.toLowerCase().includes(query) ||
      integration.what_possible.some((action: string) => action.toLowerCase().includes(query)),
  );
};

/**
 * Split integrations into enabled and available
 * For now, first 4 are considered enabled (placeholder logic)
 */
export const splitIntegrations = (integrations: IntegrationType[]) => {
  return {
    enabled: integrations.slice(0, 4),
    available: integrations.slice(4),
  };
};

/**
 * Map a set of per-tool permissions to the aggregate access level shown in the UI.
 * Returns CUSTOM when tools differ, or the matching access level when all tools share one.
 */
export const deriveAccessLevel = (tools?: { permission: ToolPermissionType }[]): AccessLevelType => {
  if (!tools?.length) return ACCESS_LEVEL.CUSTOM;

  const first = tools[0]!.permission;
  const allSame = tools.every((t) => t?.permission === first);

  if (!allSame) return ACCESS_LEVEL.CUSTOM;

  return ACCESS_LEVEL_OPTIONS.find((opt) => opt?.permission === first)?.value ?? ACCESS_LEVEL.CUSTOM;
};

/** Build loading-state placeholders for a list of connections so the UI can render skeletons. */
export const buildSkeletonConnections = (connections: ConnectionEntryType[]): ConnectionWithPeopleType[] =>
  connections.map((conn) => ({
    connectionId: conn.id,
    connectionName: conn.name,
    people: [],
    agents: [],
    isLoadingAudiences: true,
  }));

/** Flatten a set of cached connections into a `connectionId:userId` -> PersonEntry lookup map. */
export const indexPeopleByConnectionAndUser = (
  connections: ConnectionWithPeopleType[] | undefined,
): Map<string, PersonEntryType> => {
  const map = new Map<string, PersonEntryType>();

  connections?.forEach((c) => {
    [...c.people, ...c.agents].forEach((p) => {
      map.set(`${c.connectionId}:${p.userId}`, p);
    });
  });

  return map;
};

/** Turn a raw integration tools API response into an `AgentToolType[]` with default ASK (needs_approval) permissions. */
export const mapIntegrationToolsToBaseTools = (toolItems: { name: string; display_name?: string }[]): AgentToolType[] =>
  toolItems.map((t) => ({
    id: t.name,
    name: t.display_name || t.name,
    permission: TOOL_PERMISSION.ASK,
  }));

interface BuildConnectionsFromAudiencesInput {
  audiencesByConn: { conn: ConnectionEntryType; audiences: AudiencesByResourceResponse[] }[];
  baseTools: AgentToolType[];
  agentNameById: Map<string, string>;
  existingPeopleById: Map<string, PersonEntryType>;
}

/**
 * Build the UI-ready connection rows from raw audience + tool data, preserving any
 * already-loaded per-person state from a previous render pass.
 */
export const buildConnectionsFromAudiences = ({
  audiencesByConn,
  baseTools,
  agentNameById,
  existingPeopleById,
}: BuildConnectionsFromAudiencesInput): ConnectionWithPeopleType[] =>
  audiencesByConn.map(({ conn, audiences }) => {
    const userAudiences = audiences.filter((a) => a.resource_audience_type === ResourceAudienceType.USER);

    const people = userAudiences.map((audience): PersonEntryType => {
      const agentName = agentNameById.get(audience.resource_audience_id);
      const isAgent = !!agentName;
      const resolvedName = agentName ?? (audience.user?.name || audience.user?.email || 'Anonymous User');
      const hasRapId = !!audience.resource_audience_policy_id;
      const existing = existingPeopleById.get(`${conn.id}:${audience.resource_audience_id}`);
      // Preserve previously loaded tools & accessLevel if we have them cached
      const personTools = existing?.tools.length ? existing.tools : baseTools.map((t) => ({ ...t }));
      const isLoadingPolicies = existing && !existing.isLoadingPolicies ? false : hasRapId;

      return {
        userId: audience.resource_audience_id,
        name: resolvedName,
        email: isAgent ? '' : (audience.user?.email ?? ''),
        resourceAudiencePolicyId: audience.resource_audience_policy_id,
        isAgent,
        role: audience.privilege === CONNECTION_ROLE.ADMIN ? CONNECTION_ROLE.ADMIN : CONNECTION_ROLE.VIEWER,
        tools: personTools,
        accessLevel: existing && !existing.isLoadingPolicies ? existing.accessLevel : deriveAccessLevel(personTools),
        isLoadingPolicies,
        audience: {
          type: audience.resource_audience_type as ActionAudienceKind,
          id: audience.resource_audience_id,
        },
        existingPolicies: existing?.existingPolicies,
      };
    });

    return {
      connectionId: conn.id,
      connectionName: conn.name,
      people: people.filter((p) => !p.isAgent),
      agents: people.filter((p) => p.isAgent),
      isLoadingAudiences: false,
    };
  });

/** Apply a policies API response over a base tool list to produce the per-person tool state. */
export const applyPoliciesToTools = (
  baseTools: AgentToolType[],
  policiesRes: ToolPoliciesApiResponse | undefined,
): AgentToolType[] => {
  const policyMap = new Map<string, ToolPermissionType>();

  policiesRes?.policies?.forEach((p) => {
    const permission = POLICY_TO_PERMISSION[p?.policy];

    if (permission) {
      policyMap.set(p?.tool_name, permission);
    }
  });

  return baseTools.map((tool) => ({
    ...tool,
    permission: policyMap.get(tool.id) ?? tool.permission,
  }));
};
