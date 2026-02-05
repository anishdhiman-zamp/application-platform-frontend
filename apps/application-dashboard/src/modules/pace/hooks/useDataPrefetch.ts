import { useGetDatasetListingQuery } from '@/apis/dataset';
import { useGetConversationHistoryQuery, useListSkillsQuery } from '@/apis/pace';
import { useGetPagesQuery } from '@/apis/pages';
import { useAppSelector } from '@/hooks/toolkit';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { ARTIFACTS_PAGE_SIZE } from '@/modules/pace/artifacts/artifacts.constants';
import type { RootState } from '@/store';
import { ResourceType } from '@/types/api/policies.types';

const useDataPrefetch = () => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';

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
