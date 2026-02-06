import { useGetDatasetListingQuery } from '@/apis/dataset';
import { useGetConversationHistoryQuery, useListSkillsQuery } from '@/apis/pace';
import { useGetPagesQuery } from '@/apis/pages';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { ARTIFACTS_PAGE_SIZE } from '@/modules/pace/artifacts/artifacts.constants';
import { ResourceType } from '@/types/api/policies.types';
import { getUserSession } from '@/utils/cookie';

const useDataPrefetch = () => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();
  const userSession = getUserSession();
  const organizationId = userSession?.default_org_id ?? '';

  useGetConversationHistoryQuery(
    {
      resourceType: ResourceType.ORGANIZATION,
      resourceId: organizationId,
      page: 1,
      limit: 20,
    },
    {
      skip: !organizationId || isLoading || !isPaceChatEnabled,
      refetchOnMountOrArgChange: false,
    },
  );

  useListSkillsQuery(
    {},
    {
      refetchOnMountOrArgChange: false,
      skip: !isPaceChatEnabled || isLoading,
    },
  );

  useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    skip: !isPaceChatEnabled || isLoading,
  });

  useGetDatasetListingQuery(
    { page: 1, pageSize: ARTIFACTS_PAGE_SIZE },
    {
      refetchOnMountOrArgChange: false,
      skip: !isPaceChatEnabled || isLoading,
    },
  );

  return null;
};

export default useDataPrefetch;
