'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import { useLazyGetIntegrationToolsQuery } from '@/apis/agents';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useLazyGetAudiencesByResourceIdQuery, usePostShareResourceToAudiencesMutation } from '@/apis/collaboration';
import type { ArrayListOption } from '@/components/multiSelectInput/multiSelectInput.types';
import { useAppSelector } from '@/hooks/toolkit';
import { useShareableAudiences } from '@/modules/integrations/IntegrationDetail/useShareableAudiences';
import {
  useEnsureResourceAction,
  useSyncToolPolicies,
} from '@/modules/integrations/IntegrationDetail/useSyncToolPolicies';
import { CONNECTION_ROLE, type ConnectionRoleType } from '@/modules/integrations/types/integrations.types';
import type { ActionAudienceKind } from '@/modules/integrations/types/policies.types';
import {
  ACCESS_LEVEL_OPTIONS,
  PERMISSION_TO_POLICY,
} from '@/modules/pace/components/agents/constants/agents.constants';
import {
  ACCESS_LEVEL,
  type AccessLevelType,
  type AgentToolType,
  TOOL_PERMISSION,
  type ToolPermissionType,
} from '@/modules/pace/components/agents/types/agents.types';
import { resourceTypeRouteMap } from '@/modules/shareResource/shareResource.constants';
import { ResourceType } from '@/modules/shareResource/shareResource.types';
import type { RootState } from '@/store';
import { ResourceAudienceType } from '@/types/api/auth.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const deriveAccessLevelFromTools = (tools: AgentToolType[]): AccessLevelType => {
  if (!tools.length) return ACCESS_LEVEL.CUSTOM;

  const first = tools[0]!.permission;
  const allSame = tools.every((t) => t.permission === first);

  if (!allSame) return ACCESS_LEVEL.CUSTOM;

  return ACCESS_LEVEL_OPTIONS.find((opt) => opt.permission === first)?.value ?? ACCESS_LEVEL.CUSTOM;
};

interface UseShareConnectionArgs {
  open: boolean;
  connectionId: string;
  integrationName: string;
  onShared?: () => void;
  onClose: () => void;
}

export const useShareConnection = ({
  open,
  connectionId,
  integrationName,
  onShared,
  onClose,
}: UseShareConnectionArgs) => {
  // state
  const [search, setSearch] = useState('');
  const [tools, setTools] = useState<AgentToolType[]>([]);
  const [showValidationError, setShowValidationError] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);
  const [role, setRole] = useState<ConnectionRoleType>(CONNECTION_ROLE.ADMIN);
  const [accessLevel, setAccessLevel] = useState<AccessLevelType>(ACCESS_LEVEL.NEED_APPROVAL);

  // derived state
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';

  // hooks (RTK)
  const [fetchIntegrationTools] = useLazyGetIntegrationToolsQuery();
  const [fetchAudiences] = useLazyGetAudiencesByResourceIdQuery();
  const [shareResource, { isLoading: isSharing }] = usePostShareResourceToAudiencesMutation();
  const { syncToolPolicies } = useSyncToolPolicies();
  const ensureResourceAction = useEnsureResourceAction();

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((item) => item.resource_audience_id ?? item.value)),
    [selectedItems],
  );

  const {
    allKnownOptions,
    optionsList,
    existingAudiences,
    isError: isAudiencesError,
  } = useShareableAudiences({
    organizationId,
    existingAudiencesEndpoint: API_ENDPOINTS.RESOURCE_AUDIENCES_BY_RESOURCE_ID_GET_V2,
    resourceRoute: resourceTypeRouteMap[ResourceType.CONNECTION],
    resourceId: connectionId,
    enabled: !!connectionId && open,
    selectedIds,
  });

  const existingAudienceIds = useMemo(
    () => new Set(existingAudiences.map((a) => a.resource_audience_id)),
    [existingAudiences],
  );

  const hasSelection = selectedItems.length > 0;
  const canShare = hasSelection && !showValidationError;

  // handlers
  const loadTools = useCallback(() => {
    fetchIntegrationTools({ integrationName })
      .unwrap()
      .then((res) => {
        const items = res?.items ?? res?.tools ?? [];

        setTools(items.map((t) => ({ id: t.name, name: t.display_name || t.name, permission: TOOL_PERMISSION.ASK })));
      })
      .catch(() => {
        toast.error('Failed to load tools');
      });
  }, [fetchIntegrationTools, integrationName]);

  const handleOptionSelection = useCallback((option: { value: string; label: string; type?: string }) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        value: option.value,
        label: option.label,
        valid: true,
        resource_audience_type: option.type ?? ResourceAudienceType.AGENT,
        resource_audience_id: option.value,
      },
    ]);
    setSearch('');
  }, []);

  const handleValidateAndAdd = useCallback(
    ({ value, label, type }: { value: string; label: string; color?: string; type?: string; team_id?: string }) => {
      // If `type` is passed, the selection came from the dropdown — use it directly.
      if (type) {
        if (existingAudienceIds.has(value) || selectedIds.has(value)) {
          toast.info('This user already has access');

          return;
        }
        handleOptionSelection({ value, label, type });

        return;
      }

      // Otherwise this is raw text input — try to match it against a known audience by label or email.
      const typed = value.trim().toLowerCase();
      const matchedOption = allKnownOptions.find((opt) => {
        const optLabel = opt.label.toLowerCase();
        const optEmail = opt.email?.toLowerCase() ?? '';

        return optLabel === typed || optEmail === typed || optLabel.includes(typed) || optEmail.includes(typed);
      });

      if (matchedOption) {
        if (existingAudienceIds.has(matchedOption.value) || selectedIds.has(matchedOption.value)) {
          toast.info('This user already has access');

          return;
        }
        handleOptionSelection(matchedOption);

        return;
      }

      const isAgent = type === ResourceAudienceType.AGENT;
      const isValid = isAgent ? true : EMAIL_REGEX.test(value);

      setSelectedItems((prev) => [
        ...prev,
        {
          value,
          label,
          valid: isValid,
          resource_audience_type: isAgent ? ResourceAudienceType.AGENT : ResourceAudienceType.USER,
          resource_audience_id: value,
        },
      ]);

      if (!isValid) setShowValidationError(true);
    },
    [allKnownOptions, existingAudienceIds, selectedIds, handleOptionSelection],
  );

  const handleAccessLevelChange = useCallback((level: AccessLevelType) => {
    setAccessLevel(level);
    const option = ACCESS_LEVEL_OPTIONS.find((opt) => opt.value === level);

    if (option?.permission) {
      setTools((prev) => prev.map((t) => ({ ...t, permission: option.permission! })));
    }
  }, []);

  const handleToolPermissionChange = useCallback((toolId: string, permission: ToolPermissionType) => {
    setTools((prev) => {
      const updated = prev.map((t) => (t.id === toolId ? { ...t, permission } : t));

      setAccessLevel(deriveAccessLevelFromTools(updated));

      return updated;
    });
  }, []);

  const applyToolPoliciesToAudiences = useCallback(
    (audienceIds: Set<string>) => {
      if (tools.length === 0) return Promise.resolve();

      const policies = tools.map((t) => ({
        tool_name: t.id,
        policy: PERMISSION_TO_POLICY[t.permission],
      }));

      return fetchAudiences({
        apiEndpoint: API_ENDPOINTS.RESOURCE_AUDIENCES_BY_RESOURCE_ID_GET_V2,
        resourceRoute: resourceTypeRouteMap[ResourceType.CONNECTION],
        resourceId: connectionId,
      })
        .unwrap()
        .then(async (audiencesResult) => {
          const shares = (audiencesResult ?? [])
            .filter((a) => audienceIds.has(a.resource_audience_id) && a.resource_audience_policy_id)
            .map((a) => ({
              rapId: a.resource_audience_policy_id as string,
              audience: {
                type: a.resource_audience_type as ActionAudienceKind,
                id: a.resource_audience_id,
              },
              existingPolicies: [],
            }));

          if (shares.length === 0) return undefined;

          const resourceActionId = await ensureResourceAction(connectionId);

          await syncToolPolicies({ connectionId, resourceActionId, shares, policies });

          return undefined;
        })
        .catch(() => {
          toast.error('Shared, but failed to apply tool permissions');
        });
    },
    [tools, fetchAudiences, connectionId, syncToolPolicies, ensureResourceAction],
  );

  const handleShare = useCallback(() => {
    const validItems = selectedItems.filter((item) => item.valid);

    if (!validItems.length) return;

    const audiences = validItems.map((item) => {
      const isAgent = item.resource_audience_type === ResourceAudienceType.AGENT;

      return {
        audience_type: isAgent ? ResourceAudienceType.USER : (item.resource_audience_type ?? ResourceAudienceType.USER),
        audience_id: item.resource_audience_id || item.value,
        role,
        fgac_filters: null,
      };
    });

    return shareResource({
      apiEndpoint: API_ENDPOINTS.SHARE_RESOURCE_TO_AUDIENCES_POST_V2,
      resourceRoute: resourceTypeRouteMap[ResourceType.CONNECTION],
      resourceId: connectionId,
      body: { audiences },
    })
      .unwrap()
      .then(() => applyToolPoliciesToAudiences(new Set(audiences.map((a) => a.audience_id))))
      .then(() => {
        toast.success(`Shared with ${validItems.length} ${validItems.length === 1 ? 'user' : 'users'}`);
        setSelectedItems([]);
        setSearch('');
        onShared?.();
        onClose();
      })
      .catch((err) => {
        const error = err as { data?: { error?: string } };

        toast.error(error?.data?.error || 'Failed to share connection');
      });
  }, [selectedItems, role, shareResource, connectionId, applyToolPoliciesToAudiences, onShared, onClose]);

  // effects
  useEffect(() => {
    if (integrationName) loadTools();
  }, [integrationName, loadTools]);

  useEffect(() => {
    if (open && isAudiencesError) toast.error('Failed to load shareable audiences');
  }, [open, isAudiencesError]);

  return {
    search,
    setSearch,
    tools,
    showValidationError,
    setShowValidationError,
    selectedItems,
    setSelectedItems,
    role,
    setRole,
    accessLevel,
    optionsList,
    hasSelection,
    canShare,
    isSharing,
    handleValidateAndAdd,
    handleOptionSelection,
    handleAccessLevelChange,
    handleToolPermissionChange,
    handleShare,
  };
};
