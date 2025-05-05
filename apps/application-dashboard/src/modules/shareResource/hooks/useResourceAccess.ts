import { useCallback } from 'react';
import { resourceTypeRouteMap } from 'modules/shareResource/shareResource.constants';
import { ResourceType } from 'modules/shareResource/shareResource.types';
import { useGetAudiencesByResourceIdQuery } from '@/apis/collaboration';
import { useGetTeamsByOrganizationIdQuery } from '@/apis/people';
import { useAppSelector } from '@/hooks/toolkit';
import { RootState } from '@/store';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { AudiencesByResourceResponse } from '@/types/api/collaboration.types';

const checkPrivilege = (
  allAudiences: AudiencesByResourceResponse[],
  organizationId: string,
  userId: string,
  userTeams: string[],
  privilege: string,
) => {
  for (const audience of allAudiences) {
    switch (audience?.resource_audience_type) {
      case ResourceAudienceType.ORGANIZATION: {
        if (audience?.resource_audience_id === organizationId && audience?.privilege === privilege) {
          return true;
        }
        break;
      }
      case ResourceAudienceType.TEAM: {
        if (userTeams.includes(audience?.resource_audience_id) && audience?.privilege === privilege) {
          return true;
        }
        break;
      }
      case ResourceAudienceType.USER: {
        if (audience?.resource_audience_id === userId && audience?.privilege === privilege) {
          return true;
        }
        break;
      }
    }
  }

  return false;
};

export const useResourceAccess = (resourceType: ResourceType, resourceId: string) => {
  const { user } = useAppSelector((state: RootState) => state.user);

  const organizationId = user?.orgs?.[0]?.organization_id ?? '';
  const userId = user?.user_id ?? '';
  const effectiveResourceId = resourceType === ResourceType.PAYMENTS ? '' : (resourceId ?? '');
  const shouldSkipAudiencesQuery = resourceType === ResourceType.PAYMENTS ? false : effectiveResourceId === '';

  // get existing audiences for the resource
  const {
    data: audiencesData,
    isLoading: isLoadingAudiencesData,
    refetch: refetchAudiencesData,
  } = useGetAudiencesByResourceIdQuery(
    { resourceRoute: resourceTypeRouteMap[resourceType], resourceId },
    { skip: shouldSkipAudiencesQuery },
  );

  const { data: allTeamsData } = useGetTeamsByOrganizationIdQuery({ organizationId }, { skip: !organizationId });

  const userTeams =
    allTeamsData
      ?.map((t) => t?.team_memberships)
      .flat()
      .filter((tm) => tm?.user_id === userId)
      .map((tm) => tm?.team_id) ?? [];

  const checkUserPrivilege = useCallback(
    (privilege: string) => {
      return checkPrivilege(audiencesData ?? [], organizationId, userId, userTeams, privilege);
    },
    [audiencesData, organizationId, userId, userTeams],
  );

  return {
    audiencesData: audiencesData ?? [],
    checkUserPrivilege,
    allTeamsData,
    isLoadingAudiencesData,
    refetchAudiencesData,
  };
};
