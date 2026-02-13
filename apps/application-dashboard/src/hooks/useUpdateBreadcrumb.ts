'use client';

import { getColumnConfigForDataset, setColumnConfigForDataset } from '@zamp-platform/dataset-create-edit';
import { toast } from '@zamp-platform/ui';
import { useParams, usePathname } from 'next/navigation';
import { useUpdatePageMutation } from '@/apis/pages';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { usePendingDatasetContext } from '@/context/pendingDataset.context';
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
  const [updatePage] = useUpdatePageMutation();
  const { setPendingTitle } = usePendingDatasetContext() || {};

  const handleError = () => setEditedName(lastBreadCrumbTitle);

  const updateBreadcrumb = (updatedName: string) => {
    setIsEditing(false);
    switch (pathname?.split('/')[1]) {
      case MODULE_TYPE.DATASETS:
        if (!datasetId) return;

        // Store the title in context - it will be saved when the transaction is called
        setPendingTitle?.(updatedName);
        // Also update editedName so it doesn't revert when useEffect runs
        setEditedName(updatedName);

        // Update localStorage immediately so it's synced (org-scoped)
        try {
          const existingData = getColumnConfigForDataset(datasetId);

          // Preserve existing columns and dataset_unique_key_name
          const existingColumns = (existingData as { columns?: unknown[] })?.columns || [];
          const existingUniqueKeyName =
            (existingData as { dataset_unique_key_name?: string })?.dataset_unique_key_name || '';

          setColumnConfigForDataset(datasetId, {
            dataset_name: updatedName.trim(),
            dataset_unique_key_name: existingUniqueKeyName,
            columns: existingColumns,
          });

          // Dispatch custom event to notify breadcrumb to re-render
          window.dispatchEvent(new Event('localStorageUpdated'));
        } catch (error) {
          console.error('[useUpdateBreadcrumb] Error updating localStorage:', error);
        }
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
