import { toast } from '@zamp-platform/ui';
import { useParams, usePathname } from 'next/navigation';
import { useUpdateDatasetMutation } from '@/apis/admin';
import { APITags } from '@/constants/api.constants';
import { MODULE_TYPE } from '@/types/commonTypes';

const useUpdateBreadcrumb = (setIsEditing: (flag: boolean) => void) => {
  const params = useParams();
  const pathname = usePathname();
  const datasetId = params?.datasetId as string;
  const [updateDataset] = useUpdateDatasetMutation();

  const updateBreadcrumb = (updatedName: string) => {
    setIsEditing(false);
    switch (pathname?.split('/')[1]) {
      case MODULE_TYPE.DATASETS:
        if (!datasetId) return;

        updateDataset({
          datasetId,
          title: updatedName,
          invalidateTags: [APITags.GET_DATASET_ALL_LISTING, APITags.GET_DATASET_LISTING],
        })
          .unwrap()
          .then(() => {
            toast.success('Dataset title updated successfully');
          })
          .catch(() => {
            toast.error('Failed to update dataset title');
          });
        break;
      default:
        break;
    }
  };

  return updateBreadcrumb;
};

export default useUpdateBreadcrumb;
