import { useGetConversationHistoryQuery, useListChatModelsQuery } from '@/apis/pace';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { ResourceType } from '@/types/api/policies.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const useDataPrefetch = () => {
  const { isEnabled: isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();
  const organizationId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) ?? '';

  const shouldSkip = !organizationId || isLoading || !isPaceChatEnabled;

  useGetConversationHistoryQuery(
    {
      resourceType: ResourceType.ORGANIZATION,
      resourceId: organizationId,
      page: 1,
      limit: 30,
    },
    {
      skip: shouldSkip,
      refetchOnMountOrArgChange: false,
    },
  );

  useListChatModelsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    skip: shouldSkip,
  });

  return null;
};

export default useDataPrefetch;
