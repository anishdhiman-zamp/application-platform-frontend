import {
  DEFAULT_TOOL_POLICY,
  LEGACY_TO_POLICY_ACTION,
  type LegacyPolicyValue,
  POLICY_ACTION,
  POLICY_ACTION_TO_LEGACY,
} from '@/modules/integrations/constants/policies.constants';
import type {
  ActionAudienceRefBackend,
  BulkPolicyCreateItem,
  BulkPolicyUpdateItem,
  ListPoliciesBackendResponse,
  PolicyConfigBackend,
} from '@/modules/integrations/types/policies.types';
import type { ToolPoliciesApiResponse } from '@/modules/pace/components/agents/types/agents.types';

export interface PoliciesDiff {
  creates: BulkPolicyCreateItem[];
  updates: BulkPolicyUpdateItem[];
}

/**
 * Extracts the tool_name from a policy_configurations.conditions leaf that
 * matches the grid shape (single EQ on tool_name). Returns null if the
 * policy isn't a grid-shaped rule.
 */
export const extractToolName = (config: PolicyConfigBackend): string | null => {
  const leaves = config.conditions?.conditions ?? [];
  const leaf = leaves.find((c) => c.field === 'tool_name' && c.operator === '==' && typeof c.value === 'string');

  return leaf ? (leaf.value as string) : null;
};

/** Adapts the backend list response into the FE's legacy {tool_name, policy} grid shape. */
export const toLegacyToolPoliciesResponse = (
  backend: ListPoliciesBackendResponse,
  connectionId: string,
  resourceAudiencePolicyId: string,
): ToolPoliciesApiResponse => {
  const policies = backend.policies
    .map((p) => {
      const toolName = extractToolName(p.policy_configurations);

      if (!toolName) return null;

      return {
        tool_policy_id: p.id,
        tool_name: toolName,
        display_name: toolName,
        policy: POLICY_ACTION_TO_LEGACY[p.policy_configurations.action] ?? DEFAULT_TOOL_POLICY,
        connection_id: connectionId,
        resource_audience_policy_id: resourceAudiencePolicyId,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return {
    connection_id: connectionId,
    resource_audience_policy_id: resourceAudiencePolicyId,
    policies,
    default_policy: DEFAULT_TOOL_POLICY,
  };
};

/** Builds a `policies.policy_configurations` blob for a basic grid rule. */
export const buildGridPolicyConfig = (
  audienceType: ActionAudienceRefBackend['type'],
  audienceId: string,
  toolName: string,
  legacyPolicy: string,
): PolicyConfigBackend => ({
  applies_to: [{ type: audienceType, id: audienceId }],
  conditions: {
    logical_operator: '&&',
    conditions: [{ field: 'tool_name', operator: '==', value: toolName }],
  },
  action: LEGACY_TO_POLICY_ACTION[legacyPolicy as LegacyPolicyValue] ?? POLICY_ACTION.REQUIRE_APPROVAL,
});

export interface ExistingPolicyDigest {
  id: string;
  tool_name: string;
  legacyPolicy: string;
}

/**
 * Pure diff: given the existing policies for one (connection, share) pair and
 * the desired grid-style rules, returns the create / update batches to send
 * to `POST /policies` and `PATCH /policies`. Policies are never deleted from
 * the FE — once a row exists for a tool it stays, even when the grid value
 * matches the default.
 */
export const diffPoliciesForShare = (
  existing: ExistingPolicyDigest[],
  desired: { tool_name: string; policy: string }[],
  audience: { type: ActionAudienceRefBackend['type']; id: string },
): PoliciesDiff => {
  const existingByTool = new Map<string, ExistingPolicyDigest>();

  for (const p of existing) {
    if (p.tool_name) existingByTool.set(p.tool_name, p);
  }

  const creates: BulkPolicyCreateItem[] = [];
  const updates: BulkPolicyUpdateItem[] = [];

  for (const entry of desired) {
    const existingPolicy = existingByTool.get(entry.tool_name);
    const config = buildGridPolicyConfig(audience.type, audience.id, entry.tool_name, entry.policy);

    if (!existingPolicy) {
      creates.push({
        name: `${entry.tool_name} (${entry.policy})`,
        description: '',
        policy_configurations: config,
      });
      continue;
    }
    if (existingPolicy.legacyPolicy === entry.policy) continue;
    updates.push({
      id: existingPolicy.id,
      name: `${entry.tool_name} (${entry.policy})`,
      policy_configurations: config,
    });
  }

  return { creates, updates };
};
