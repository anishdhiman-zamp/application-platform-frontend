import { useState } from 'react';
import {
  Button,
  CopyToClipboard,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  DialogTrigger,
  toast,
} from '@zamp-platform/ui';
import { Copy, X } from 'lucide-react';
import Image from 'next/image';
import { useDeleteTriggerSubscriptionMutation } from '@/apis/triggers';
import { IMAGE_PREFIX } from '@/constants/icons';
import { CombinedTriggerType } from '@/modules/process/knowledge-base-creation/utils/triggerUtils';
import { cn } from '@/utils/common';

type TriggerItemProps = {
  trigger: CombinedTriggerType;
  hideDeleteButton?: boolean;
  connectionNameClassName?: string;
};

export const TriggerChip = ({
  text,
  logo,
  isFirst,
  isLast,
  labelClassName,
}: {
  text: string;
  logo?: string;
  isFirst?: boolean;
  isLast?: boolean;
  labelClassName?: string;
}) => {
  return (
    <span
      className={cn(
        'flex h-6 items-center gap-1.5 bg-gray-100 px-2',
        { 'rounded-l': isFirst },
        { 'rounded-r': isLast },
      )}
    >
      {logo && (
        <span className='relative size-[14px] flex-shrink-0'>
          <Image src={`${IMAGE_PREFIX}${logo}`} alt={text} priority fill sizes='14px' className='object-contain' />
        </span>
      )}
      <span className={cn('max-w-[100px] truncate', labelClassName)} title={text}>
        {text}
      </span>
    </span>
  );
};

const TriggerConnectionNameCopyButton = ({ text, hideDeleteButton }: { text: string; hideDeleteButton?: boolean }) => {
  return (
    <CopyToClipboard text={text} tooltipText='Click to copy'>
      <span
        className={cn('flex cursor-pointer items-center justify-center bg-gray-100 p-1.5', {
          'rounded-r': hideDeleteButton,
        })}
      >
        <Copy size={12} className='text-gray-900' />
      </span>
    </CopyToClipboard>
  );
};

const TriggerDeleteConfirmationDialog = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  const [deleteTriggerSubscription, { isLoading: isDeletingTrigger }] = useDeleteTriggerSubscriptionMutation();

  const handleDelete = () => {
    deleteTriggerSubscription({ subscription_id: id })
      .unwrap()
      .then(() => {
        // Success - no toast needed, UI already updated optimistically
        setOpen(false);
      })
      .catch(() => {
        // Error - trigger will be restored by the mutation's rollback
        toast.error('Failed to delete trigger');
        setOpen(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className='flex cursor-pointer items-center justify-center rounded-r bg-gray-100 p-1.5'>
        <X size={12} className='text-gray-900' />
      </DialogTrigger>
      <DialogContent size='small' showCloseButton className='w-[400px]' id='delete-page-dialog'>
        <DialogHeader className='border-none'>
          <DialogHeaderTitle>Delete Trigger</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 px-5 pt-0 pb-5'>
          Are you sure you want to delete this trigger? This action cannot be undone.
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary'>Cancel</Button>
          </DialogClose>
          <Button variant='destructive' onClick={handleDelete} isLoading={isDeletingTrigger}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TriggerItem = ({ trigger, hideDeleteButton, connectionNameClassName }: TriggerItemProps) => {
  return (
    <div className='f-12-450 flex items-center gap-0.5'>
      <TriggerChip text={trigger.trigger_display_name} logo={trigger.integration_logo} isFirst />
      <TriggerChip text={trigger.connection_name} labelClassName={connectionNameClassName} />
      <TriggerConnectionNameCopyButton text={trigger.connection_name} hideDeleteButton={hideDeleteButton} />
      {!hideDeleteButton && <TriggerDeleteConfirmationDialog id={trigger.id} />}
    </div>
  );
};
