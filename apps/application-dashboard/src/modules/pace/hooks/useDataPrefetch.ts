import { useGetDatasetListingQuery } from '@/apis/dataset';
import { useGetConversationHistoryQuery, useListSkillsQuery } from '@/apis/pace';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { ARTIFACTS_PAGE_SIZE } from '@/modules/pace/artifacts/artifacts.constants';
import { ResourceType } from '@/types/api/policies.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const useDataPrefetch = () => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();
  // const { isFilesystemActive, isFilesystemStatusLoading } = useFilesystemStatus();
  const organizationId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) ?? '';

  const shouldSkip = !organizationId || isLoading || !isPaceChatEnabled;

  useGetConversationHistoryQuery(
    {
      resourceType: ResourceType.ORGANIZATION,
      resourceId: organizationId,
      page: 1,
      limit: 20,
    },
    {
      skip: shouldSkip,
      refetchOnMountOrArgChange: false,
    },
  );

  useListSkillsQuery(
    {},
    {
      refetchOnMountOrArgChange: false,
      skip: shouldSkip,
    },
  );

  useGetDatasetListingQuery(
    { page: 1, pageSize: ARTIFACTS_PAGE_SIZE },
    {
      refetchOnMountOrArgChange: false,
      skip: shouldSkip,
    },
  );

  return null;
};

export default useDataPrefetch;
