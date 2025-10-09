import { useAppDispatch } from '@/hooks/toolkit';
import { setSelectedDatasetIds } from '@/store/slices/sheet-filters';

const useUpdateDatasetIds = () => {
  const dispatch = useAppDispatch();

  const updateDatasetIds = (datasetIds: string[]) => {
    dispatch(setSelectedDatasetIds(datasetIds));
  };

  return updateDatasetIds;
};

export default useUpdateDatasetIds;
