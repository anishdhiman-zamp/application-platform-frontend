import { useMemo, useState } from 'react';
import {
  Button,
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
import { useUpdateDatasetMutation } from '@/apis/admin';
import { APITags } from '@/constants/api.constants';
import { COLORS } from '@/constants/colors';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { DATASET_ACCESS_PRIVILEGES } from '@/modules/shareResource/shareResource.types';
import { ResourceType } from '@/types/api/policies.types';

const EditNameDescription = (props: ICellRendererParams) => {
  const { data } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string>();

  const [updateDataset, { isLoading }] = useUpdateDatasetMutation();

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.DATASET,
    resourceId: data?.id as string,
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

    updateDataset({
      datasetId: data?.id as string,
      title,
      description,
      invalidateTags: [APITags.GET_DATASET_LISTING, APITags.GET_DATASET_ALL_LISTING],
    })
      .unwrap()
      .then(() => {
        toast.success('Dataset updated successfully');
      })
      .catch(() => {
        toast.error('Failed to update dataset');
      })
      .finally(() => {
        setIsOpen(false);
      });
  };

  const isDisabled = useMemo(() => {
    return !title || (title === data?.title && description === data?.description) || isLoading;
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
              <SvgSpriteLoader id='edit-03' size={14} color={COLORS.GRAY_900} />
            </Button>
          </DialogTrigger>
          <DialogContent size='medium_small'>
            <form onSubmit={handleSubmit}>
              <div className='mx-5 mt-5 mb-6 space-y-5'>
                <Input placeholder='Name' value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea
                  className='min-h-[108px] focus:border-gray-600 focus:ring-2 focus:ring-gray-400'
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
                <Button type='submit' size='medium' disabled={isDisabled} isLoading={isLoading}>
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
