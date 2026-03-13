'use client';

import { useMemo, useState } from 'react';
import { useResource } from '@zamp-platform/battalion';
import { getColumnConfigForDataset, setColumnConfigForDataset } from '@zamp-platform/dataset-create-edit';
import { DATASET_TOAST_MESSAGES } from '@zamp-platform/dataset-create-edit/constants';
import {
  Button,
  CSS_VARS,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Input,
  Textarea,
  toast,
} from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ICellRendererParams } from 'ag-grid-community';
import { Dataset } from '@/app/(authenticated)/resources/dataset.resource';
import { usePendingDatasetContextOptional } from '@/context/pendingDataset.context';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { DATASET_ACCESS_PRIVILEGES } from '@/modules/shareResource/shareResource.types';
import { ResourceType } from '@/types/api/policies.types';
import { dispatchDatasetUpdated } from '@/utils/events';

const EditNameDescription = (props: ICellRendererParams) => {
  const { data } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string>();

  // Use Battalion resource for transaction API
  const { update: updateDataset, isUpdating: isLoading } = useResource<Dataset>('Dataset');

  // Get pendingTitle context to update it when title changes
  const pendingTitleContext = usePendingDatasetContextOptional?.();

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: data?.id as string,
    skipAudienceData: false,
    skipTeamsData: false,
  });

  const isCurrentUserAdmin = useMemo(() => {
    return checkUserPrivilege(DATASET_ACCESS_PRIVILEGES.ADMIN);
  }, [checkUserPrivilege]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (title === data?.title && description === data?.description) {
      setIsOpen(false);

      return;
    }

    // Validate title is not empty
    const trimmedTitle = title?.trim();

    if (!trimmedTitle || trimmedTitle === '') {
      toast.error('Dataset title cannot be empty');

      return;
    }

    // Call transaction API with title and description
    updateDataset(data?.id as string, {
      title: trimmedTitle,
      description: description || undefined,
    });

    // Update localStorage with the new title immediately (org-scoped)
    if (data?.id) {
      const existingData = getColumnConfigForDataset(data.id);

      // Preserve existing columns and dataset_unique_key_name
      const existingColumns = (existingData as { columns?: unknown[] })?.columns || [];
      const existingUniqueKeyName =
        (existingData as { dataset_unique_key_name?: string })?.dataset_unique_key_name || '';

      setColumnConfigForDataset(data.id, {
        dataset_name: trimmedTitle,
        dataset_unique_key_name: existingUniqueKeyName,
        columns: existingColumns,
      });

      // Dispatch dataset updated event to notify other components (e.g., breadcrumb)
      dispatchDatasetUpdated(data.id);
    }

    // Update pendingTitle context so breadcrumb reflects the change immediately
    if (pendingTitleContext?.setPendingTitle) {
      pendingTitleContext.setPendingTitle(trimmedTitle);
    }

    toast.success(DATASET_TOAST_MESSAGES.DATASET_UPDATED_SUCCESS);
    setIsOpen(false);
  };

  const isDisabled = useMemo(() => {
    return (
      !title?.trim() ||
      !description?.trim() ||
      (title === data?.title && description === data?.description) ||
      isLoading
    );
  }, [isLoading, title, description, data?.title, data?.description]);

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTitle(data?.title);
      setDescription(data?.description);
    }
  };

  return (
    <>
      {isCurrentUserAdmin && (
        <Dialog open={isOpen} onOpenChange={handleOpen}>
          <DialogTrigger asChild>
            <Button variant='ghost' size='xxsmall' id='edit-name-description' className='h-[22px] w-[22px]'>
              <SvgSpriteLoader id='edit-03' size={14} color={CSS_VARS.GRAY_900} />
            </Button>
          </DialogTrigger>
          <DialogContent size='medium_small'>
            <form onSubmit={handleSubmit}>
              <div className='mx-5 mt-5 mb-6 space-y-5'>
                <Input placeholder='Name' value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea
                  className='max-h-[200px] min-h-[108px] focus:border-gray-600 focus:ring-2 focus:ring-gray-400'
                  placeholder='Description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <DialogFooter className='flex justify-end gap-2.5'>
                <DialogClose asChild>
                  <Button variant='secondary' size='medium'>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type='submit' size='medium' disabled={isDisabled}>
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EditNameDescription;
