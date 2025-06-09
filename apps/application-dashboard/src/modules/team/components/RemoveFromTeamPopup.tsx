import React, { FC } from 'react';
import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import { RemoveFromTeamPopupPropsType } from 'modules/team/people.types';

const RemoveFromTeamPopup: FC<RemoveFromTeamPopupPropsType> = ({
  isOpen,
  onClose,
  onDelete,
  isLoading,
  warningDescription,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size='small'
        className='z-1004 w-[450px]'
        showCloseButton
        onClick={(e) => e.stopPropagation()}
        dialogueOverlayClassName='z-1004'
      >
        <DialogHeader className='f-16-600 text-GRAY_950'>Remove from team</DialogHeader>
        <DialogBody>
          <div className='f-14-400 text-GRAY_950 mt-6 px-5 pb-5'>{warningDescription}</div>
        </DialogBody>
        <DialogFooter>
          <div className='flex justify-end gap-2'>
            <DialogClose asChild>
              <Button variant='secondary' size='small'>
                Cancel
              </Button>
            </DialogClose>
            <Button variant='destructive' size='small' onClick={onDelete} isLoading={isLoading}>
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveFromTeamPopup;
