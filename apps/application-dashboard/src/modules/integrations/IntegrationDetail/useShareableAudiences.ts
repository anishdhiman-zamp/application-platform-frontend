'use client';

import { useMemo } from 'react';
import { useGetAgentsListQuery } from '@/apis/agents';
import { useGetAudiencesByResourceIdQuery } from '@/apis/collaboration';
import { useGetAudiencesByOrganisationIdQuery, useGetTeamsByOrganizationIdQuery } from '@/apis/people';
import { useTheme } from '@/app/_providers/theme-provider';
import { useAppSelector } from '@/hooks/toolkit';
import { THEME_MODE } from '@/modules/general/constants/general.constants';
import { resolveChipColor } from '@/modules/team/people.utils';
import type { RootState } from '@/store';
import { ResourceAudienceType } from '@/types/api/auth.types';
import type { AudiencesByResourceResponse } from '@/types/api/collaboration.types';

export interface ShareableAudienceOption {
  value: string;
  label: string;
  email: string;
  type: ResourceAudienceType;
  color?: string;
}

interface UseShareableAudiencesArgs {
  organizationId: string;
  existingAudiencesEndpoint?: string;
  resourceRoute?: string;
  resourceId?: string;
  enabled?: boolean;
  selectedIds?: Set<string>;
}

/**
 * Builds the merged "shareable audiences" list (agents + team members + any
 * already-shared users on a given resource) for the share-with multi-select.
 * Used by both `useShareConnection` and the connect-integration dialog.
 *
 * Returns:
 * - `allKnownOptions`: every audience this user can possibly share with (used for validation)
 * - `optionsList`: same list with already-shared and currently-selected audiences filtered out
 * - `existingAudiences`: raw audience rows for callers that need RAP ids etc.
 */
export const useShareableAudiences = ({
  organizationId,
  existingAudiencesEndpoint,
  resourceRoute,
  resourceId,
  enabled = true,
  selectedIds,
}: UseShareableAudiencesArgs) => {
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === THEME_MODE.DARK;

  const { data: agentsData, isError: isAgentsError } = useGetAgentsListQuery({ filter: 'all' }, { skip: !enabled });
  const { data: teamMembersData, isError: isTeamMembersError } = useGetAudiencesByOrganisationIdQuery(
    { organizationId },
    { skip: !enabled || !organizationId },
  );
  const { data: teamsData, isError: isTeamsError } = useGetTeamsByOrganizationIdQuery(
    { organizationId },
    { skip: !enabled || !organizationId },
  );
  const skipExistingFetch = !enabled || !existingAudiencesEndpoint || !resourceRoute || !resourceId;
  const { data: existingAudiencesData, isError: isExistingAudiencesError } = useGetAudiencesByResourceIdQuery(
    {
      apiEndpoint: existingAudiencesEndpoint ?? '',
      resourceRoute: resourceRoute ?? '',
      resourceId: resourceId ?? '',
    },
    { skip: skipExistingFetch },
  );

  const existingAudiences: AudiencesByResourceResponse[] = useMemo(
    () => existingAudiencesData ?? [],
    [existingAudiencesData],
  );

  const existingAudienceIds = useMemo(
    () => new Set(existingAudiences.map((a) => a.resource_audience_id)),
    [existingAudiences],
  );

  const allKnownOptions = useMemo<ShareableAudienceOption[]>(() => {
    const orgOption: ShareableAudienceOption[] =
      organizationId && orgName
        ? [
            {
              value: organizationId,
              label: `Everyone in ${orgName}`,
              email: '',
              type: ResourceAudienceType.ORGANIZATION,
            },
          ]
        : [];

    const agents: ShareableAudienceOption[] = (agentsData?.agents ?? []).map((a) => ({
      value: a.id,
      label: a.name,
      email: '',
      type: ResourceAudienceType.AGENT,
    }));

    const teams: ShareableAudienceOption[] = (teamsData ?? [])
      .map((team) => ({
        value: team?.team_id ?? '',
        label: team?.name ?? '',
        email: '',
        type: ResourceAudienceType.TEAM,
        color: resolveChipColor(team?.metadata?.color_hex_code, isDark),
      }))
      .filter((t) => t.value);

    const users: ShareableAudienceOption[] = (teamMembersData ?? [])
      .filter((member) => member?.resource_audience_type !== ResourceAudienceType.AGENT)
      .map((member) => ({
        value: member?.user?.user_id ?? '',
        label: member?.user?.name || member?.user?.email || '',
        email: member?.user?.email ?? '',
        type: ResourceAudienceType.USER,
      }))
      .filter((u) => u.value);

    // Include audiences already on this resource as known users so re-typing them
    // doesn't trigger a false "invalid email" — even if they aren't in teamMembersData.
    const existingUsers: ShareableAudienceOption[] = existingAudiences
      .filter((a) => a.resource_audience_type === ResourceAudienceType.USER)
      .map((a) => ({
        value: a.resource_audience_id,
        label: a.user?.name || a.user?.email || '',
        email: a.user?.email ?? '',
        type: ResourceAudienceType.USER,
      }))
      .filter((u) => u.value);

    const seen = new Set<string>();

    return [...orgOption, ...teams, ...agents, ...users, ...existingUsers].filter((opt) => {
      if (seen.has(opt.value)) return false;
      seen.add(opt.value);

      return true;
    });
  }, [organizationId, orgName, isDark, agentsData, teamsData, teamMembersData, existingAudiences]);

  const optionsList = useMemo(
    () =>
      allKnownOptions.filter((opt) => !existingAudienceIds.has(opt.value) && !(selectedIds?.has(opt.value) ?? false)),
    [allKnownOptions, existingAudienceIds, selectedIds],
  );

  return {
    allKnownOptions,
    optionsList,
    existingAudiences,
    isError: isAgentsError || isTeamMembersError || isTeamsError || isExistingAudiencesError,
  };
};
