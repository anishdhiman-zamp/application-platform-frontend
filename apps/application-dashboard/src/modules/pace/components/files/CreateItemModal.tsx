'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Input,
} from '@zamp-platform/ui';
import type { CreateItemType } from 'modules/pace/components/files/file-tree.types';
import { CREATE_ITEM_TYPE } from 'modules/pace/components/files/file-tree.types';
import { getFileExtension } from 'modules/pace/components/files/file-tree.utils';

interface CreateItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: CreateItemType;
  onCreate: (name: string, path: string, type?: string) => void;
}

const CreateItemModal = ({ isOpen, onOpenChange, itemType, onCreate }: CreateItemModalProps) => {
  const [name, setName] = useState('');

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('');
    }
    onOpenChange(open);
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    if (itemType === CREATE_ITEM_TYPE.FILE) {
      const extension = getFileExtension(name);
      const finalName = extension ? name.trim() : `${name.trim()}.txt`;
      const fileType = extension || 'txt';

      onCreate(finalName, '/', fileType);
    } else {
      onCreate(name.trim(), '/');
    }

    handleOpenChange(false);
  };

  const isCreateDisabled = !name.trim();
  const title = itemType === CREATE_ITEM_TYPE.FILE ? 'New file' : 'New folder';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        size='small'
        showCloseButton
        className='w-[460px] rounded-[14px]'
        closeButtonClassName='top-5.5 right-5 cursor-pointer'
      >
        <DialogHeader className='h-fit border-b-0 px-5 pt-5 pb-0'>
          <DialogHeaderTitle className='f-16-600'>{title}</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-5 pt-5 pb-6'>
          <div className='flex flex-col gap-y-2'>
            <label className='f-13-500 text-GRAY_1000'>Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='h-8'
              placeholder='Type here'
              size='medium'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCreateDisabled) {
                  handleCreate();
                }
              }}
            />
          </div>
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5 p-5'>
          <Button variant='default' size='medium' onClick={handleCreate} disabled={isCreateDisabled}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateItemModal;
