import { useGetAppsQuery } from '@/apis/apps';
import { useGetConversationHistoryQuery, useListChatModelsQuery } from '@/apis/pace';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { ResourceType } from '@/types/api/policies.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const useDataPrefetch = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { isEnabled: isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();
  const organizationId = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_ORGANIZATION_ID) ?? '';

  const shouldSkip = !enabled || !organizationId || isLoading || !isPaceChatEnabled;
  const shouldSkipShellPrefetch = !organizationId || isLoading || !isPaceChatEnabled;

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

  useGetAppsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    skip: shouldSkipShellPrefetch,
  });

  return null;
};

export default useDataPrefetch;
