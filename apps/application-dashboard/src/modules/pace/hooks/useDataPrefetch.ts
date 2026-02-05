import { useGetDatasetListingQuery } from '@/apis/dataset';
import { useListSkillsQuery } from '@/apis/pace';
import { useGetPagesQuery } from '@/apis/pages';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';
import { ARTIFACTS_PAGE_SIZE } from '@/modules/pace/artifacts/artifacts.constants';

const useDataPrefetch = () => {
  const { isPaceChatEnabled, isLoading } = useIsPaceChatEnabled();

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
