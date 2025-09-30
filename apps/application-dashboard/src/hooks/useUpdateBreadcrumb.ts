import { toast } from '@zamp-platform/ui';
import { useParams, usePathname } from 'next/navigation';
import { useUpdateDatasetMutation } from '@/apis/admin';
import { useUpdatePageMutation } from '@/apis/pages';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { APITags } from '@/constants/api.constants';
import { MODULE_TYPE } from '@/types/commonTypes';

interface UseUpdateBreadcrumbProps {
  setIsEditing: (flag: boolean) => void;
  setEditedName: (name: string) => void;
  lastBreadCrumbTitle: string;
}

const useUpdateBreadcrumb = ({ setIsEditing, setEditedName, lastBreadCrumbTitle }: UseUpdateBreadcrumbProps) => {
  const params = useParams();
  const pathname = usePathname();
  const datasetId = params?.datasetId as string;
  const pageId = params?.pageId as string;
  const [updateDataset] = useUpdateDatasetMutation();
  const [updatePage] = useUpdatePageMutation();

  const handleError = () => setEditedName(lastBreadCrumbTitle);

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
            handleError();
          });
        break;
      case MODULE_TYPE.PAGES:
        if (!pageId) return;

        updatePage({
          pageId,
          body: {
            name: updatedName,
          },
        })
          .unwrap()
          .then(() => {
            toast.success(TOAST_MESSAGES.SUCCESS_PAGE_NAME_UPDATED);
          })
          .catch(() => {
            toast.error(TOAST_MESSAGES.ERROR_PAGE_NAME_UPDATE);
            handleError();
          });
        break;
      default:
        break;
    }
  };

  return updateBreadcrumb;
};

export default useUpdateBreadcrumb;
