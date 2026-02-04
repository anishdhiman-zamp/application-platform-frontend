import { useGetDatasetListingQuery } from '@/apis/dataset';
import { useListSkillsQuery } from '@/apis/pace';
import { useGetPagesQuery } from '@/apis/pages';
import { ARTIFACTS_PAGE_SIZE } from '@/modules/pace/artifacts/artifacts.constants';

const useDataPrefetch = () => {
  useListSkillsQuery(
    {},
    {
      refetchOnMountOrArgChange: false,
    },
  );

  useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  useGetDatasetListingQuery(
    { page: 1, pageSize: ARTIFACTS_PAGE_SIZE },
    {
      refetchOnMountOrArgChange: false,
    },
  );

  return null;
};

export default useDataPrefetch;
