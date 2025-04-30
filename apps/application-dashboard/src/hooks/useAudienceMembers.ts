import { useMemo } from 'react';
import { useAppSelector } from 'hooks/toolkit';
import { useGetAudiencesByResourceIdQuery } from '@/apis/collaboration';
import { useGetTeamsByOrganizationIdQuery } from '@/apis/people';
import { resourceTypeRouteMap } from '@/modules/shareResource/shareResource.constants';
import { ResourceType } from '@/modules/shareResource/shareResource.types';
import { RootState } from '@/store';

const useAudienceMembers = (args: { resourceType: ResourceType; resourceId: string }) => {
  const { user } = useAppSelector((state: RootState) => state.user);
  const organizationId = user?.orgs?.[0]?.organization_id ?? '';
  const {
    data: allTeamsData,
    isLoading: isLoadingAllTeamsData,
    error: errorAllTeamsData,
  } = useGetTeamsByOrganizationIdQuery({ organizationId }, { skip: !organizationId });
  const {
    data: audiencesData,
    isLoading: isLoadingAudiencesData,
    error: errorAudiencesData,
  } = useGetAudiencesByResourceIdQuery({
    resourceRoute: resourceTypeRouteMap[args.resourceType],
    resourceId: args.resourceId,
  });

  const loading = useMemo(() => {
    return Boolean(isLoadingAudiencesData || isLoadingAllTeamsData);
  }, [isLoadingAudiencesData, isLoadingAllTeamsData]);

  const error = useMemo(() => {
    return errorAudiencesData || errorAllTeamsData;
  }, [errorAudiencesData, errorAllTeamsData]);

  const data = useMemo(() => {
    if (!loading && audiencesData && allTeamsData) {
      return (
        audiencesData
          ?.map((audience) => {
            const matchingTeam = allTeamsData?.find((team) => team?.team_id === audience?.resource_audience_id);

            return {
              ...audience,
              team_name: matchingTeam?.name ?? '',
              team_color: matchingTeam?.metadata?.color_hex_code ?? '',
            };
          })
          .filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.resource_audience_type === item.resource_audience_type &&
                  t.resource_audience_id === item.resource_audience_id,
              ),
          ) ?? []
      );
    }

    return [];
  }, [loading, audiencesData, allTeamsData]);

  return {
    data,
    loading,
    error,
  };
};

export default useAudienceMembers;
