import { useGetConversationHistoryQuery, useListSkillsQuery } from '@/apis/pace';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { ResourceType } from '@/types/api/policies.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const useDataPrefetch = () => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();
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

  return null;
};

export default useDataPrefetch;
