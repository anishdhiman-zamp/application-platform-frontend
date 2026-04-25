'use client';

import { useCallback, useRef } from 'react';
import {
  useBulkCreatePoliciesMutation,
  useBulkUpdatePoliciesMutation,
  useCreateResourceActionMutation,
  useLazyGetResourceActionQuery,
} from '@/apis/agents';
import { POLICY_ACTION_TO_LEGACY } from '@/modules/integrations/constants/policies.constants';
import type { ActionAudienceRefBackend, PolicyResponseBackend } from '@/modules/integrations/types/policies.types';
import {
  diffPoliciesForShare,
  type ExistingPolicyDigest,
  extractToolName,
} from '@/modules/integrations/utils/policies.utils';

const toDigest = (p: PolicyResponseBackend): ExistingPolicyDigest | null => {
  const toolName = extractToolName(p.policy_configurations);

  if (!toolName) return null;

  return {
    id: p.id,
    tool_name: toolName,
    legacyPolicy: POLICY_ACTION_TO_LEGACY[p.policy_configurations.action] ?? '',
  };
};

/**
 * Resolves the (connection, invoke_tool) ResourceAction id, creating it on
 * the fly if it doesn't exist yet. Once resolved, the id is memoized
 * per-connection in a ref so subsequent calls within the same hook instance
 * skip the network entirely.
 */
export const useEnsureResourceAction = () => {
  const [getResourceAction] = useLazyGetResourceActionQuery();
  const [createResourceAction] = useCreateResourceActionMutation();
  const cacheRef = useRef<Map<string, string>>(new Map());
  const inflightRef = useRef<Map<string, Promise<string>>>(new Map());

  const ensureResourceAction = useCallback(
    (connectionId: string): Promise<string> => {
      const cached = cacheRef.current.get(connectionId);

      if (cached) return Promise.resolve(cached);

      const inflight = inflightRef.current.get(connectionId);

      if (inflight) return inflight;

      const promise = getResourceAction({ connectionId })
        .unwrap()
        .catch(() => null)
        .then(async (existing) => {
          if (existing?.id) return existing.id;
          const created = await createResourceAction({ connectionId }).unwrap();

          return created.id;
        })
        .then((id) => {
          cacheRef.current.set(connectionId, id);
          inflightRef.current.delete(connectionId);

          return id;
        })
        .catch((err) => {
          inflightRef.current.delete(connectionId);
          throw err;
        });

      inflightRef.current.set(connectionId, promise);

      return promise;
    },
    [getResourceAction, createResourceAction],
  );

  return ensureResourceAction;
};

export interface SyncShareInput {
  rapId: string;
  audience: { type: ActionAudienceRefBackend['type']; id: string };
  existingPolicies: ExistingPolicyDigest[];
}

export interface SyncToolPoliciesArgs {
  connectionId: string;
  resourceActionId: string;
  shares: SyncShareInput[];
  policies: { tool_name: string; policy: string }[];
}

/**
 * Atomic write orchestrator for one connection's tool policies.
 *
 * The caller hydrates `audience`, `resourceActionId`, and `existingPolicies`
 * from already-cached RTK queries. This keeps each permission toggle to the
 * minimum number of network calls (just the POST/PATCH writes that are
 * actually needed) — no redundant GETs.
 *
 * The bulk mutations don't invalidate any cache tags, so the grid does NOT
 * auto-refetch. Instead, this hook returns the new digest per share, built
 * from the bulk endpoints' response payloads. Callers must patch the digest
 * back into their local state so the next save's diff is correct without a
 * round-trip to the server.
 *
 * On failure, callers are responsible for any UI rollback.
 */
export const useSyncToolPolicies = () => {
  const [bulkCreatePolicies] = useBulkCreatePoliciesMutation();
  const [bulkUpdatePolicies] = useBulkUpdatePoliciesMutation();

  const syncShare = useCallback(
    async (
      connectionId: string,
      resourceActionId: string,
      share: SyncShareInput,
      policies: SyncToolPoliciesArgs['policies'],
    ): Promise<ExistingPolicyDigest[]> => {
      const { creates, updates } = diffPoliciesForShare(share.existingPolicies, policies, share.audience);

      if (creates.length === 0 && updates.length === 0) return share.existingPolicies;

      let createdRows: PolicyResponseBackend[] = [];
      let updatedRows: PolicyResponseBackend[] = [];

      if (creates.length > 0) {
        const resp = await bulkCreatePolicies({ connectionId, resourceActionId, policies: creates }).unwrap();

        createdRows = resp?.created ?? [];
      }
      if (updates.length > 0) {
        const resp = await bulkUpdatePolicies({ connectionId, resourceActionId, updates }).unwrap();

        updatedRows = resp?.updated ?? [];
      }

      // Build the new digest: previous rows whose ids weren't updated, plus the
      // updated rows, plus the newly-created rows.
      const updatedById = new Map(updatedRows.map((r) => [r.id, r]));
      const next: ExistingPolicyDigest[] = [];

      for (const prev of share.existingPolicies) {
        const updated = updatedById.get(prev.id);

        if (updated) {
          const digest = toDigest(updated);

          if (digest) next.push(digest);
        } else {
          next.push(prev);
        }
      }
      for (const created of createdRows) {
        const digest = toDigest(created);

        if (digest) next.push(digest);
      }

      return next;
    },
    [bulkCreatePolicies, bulkUpdatePolicies],
  );

  const syncToolPolicies = useCallback(
    async ({
      connectionId,
      resourceActionId,
      shares,
      policies,
    }: SyncToolPoliciesArgs): Promise<Map<string, ExistingPolicyDigest[]>> => {
      const digestsByRap = new Map<string, ExistingPolicyDigest[]>();

      for (const share of shares) {
        const next = await syncShare(connectionId, resourceActionId, share, policies);

        digestsByRap.set(share.rapId, next);
      }

      return digestsByRap;
    },
    [syncShare],
  );

  return { syncToolPolicies };
};
