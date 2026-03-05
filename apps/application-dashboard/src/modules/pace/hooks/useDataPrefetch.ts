import { useGetConversationHistoryQuery, useListChatModelsQuery, useListSkillsQuery } from '@/apis/pace';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { ResourceType } from '@/types/api/policies.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

const useDataPrefetch = () => {
  const { isEnabled: isPaceChatEnabled, isLoading } = useFeatureFlag(FEATURE_FLAGS.ZAMP_INTERNAL);
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

  useListChatModelsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    skip: shouldSkip,
  });

  return null;
};

export default useDataPrefetch;
