export const POLICY_RESOURCE_TYPE_CONNECTION = 'connection';
export const POLICY_ACTION_TYPE_INVOKE_TOOL = 'invoke_tool';

/**
 * Backend wire-format values sent to and received from `/policies`.
 * Values are uppercase because the policies API contract is uppercase
 * (`ALWAYS_ALLOW` / `REQUIRE_APPROVAL` / `BLOCK`).
 */
export const POLICY_ACTION = {
  ALWAYS_ALLOW: 'ALWAYS_ALLOW',
  REQUIRE_APPROVAL: 'REQUIRE_APPROVAL',
  BLOCK: 'BLOCK',
} as const;

/**
 * Legacy grid-shape strings used internally by the FE grid (e.g.
 * `PERMISSION_TO_POLICY`, `default_policy`). Values are lowercase to match
 * the pre-existing `{tool_name, policy}` shape consumed by chat / agents UI.
 * Mapped to/from `POLICY_ACTION` via `POLICY_ACTION_TO_LEGACY`.
 */
export const LEGACY_POLICY = {
  ALWAYS_ALLOW: 'always_allow',
  NEEDS_APPROVAL: 'needs_approval',
  BLOCKED: 'blocked',
} as const;

export type PolicyActionValue = (typeof POLICY_ACTION)[keyof typeof POLICY_ACTION];
export type LegacyPolicyValue = (typeof LEGACY_POLICY)[keyof typeof LEGACY_POLICY];

export const DEFAULT_TOOL_POLICY: LegacyPolicyValue = LEGACY_POLICY.NEEDS_APPROVAL;

// Single source of truth for the action ↔ legacy-grid mapping.
export const POLICY_ACTION_TO_LEGACY: Record<PolicyActionValue, LegacyPolicyValue> = {
  [POLICY_ACTION.ALWAYS_ALLOW]: LEGACY_POLICY.ALWAYS_ALLOW,
  [POLICY_ACTION.REQUIRE_APPROVAL]: LEGACY_POLICY.NEEDS_APPROVAL,
  [POLICY_ACTION.BLOCK]: LEGACY_POLICY.BLOCKED,
};

// Derived inverse — keep in sync automatically.
export const LEGACY_TO_POLICY_ACTION: Record<LegacyPolicyValue, PolicyActionValue> = Object.fromEntries(
  (Object.entries(POLICY_ACTION_TO_LEGACY) as [PolicyActionValue, LegacyPolicyValue][]).map(([action, legacy]) => [
    legacy,
    action,
  ]),
) as Record<LegacyPolicyValue, PolicyActionValue>;
