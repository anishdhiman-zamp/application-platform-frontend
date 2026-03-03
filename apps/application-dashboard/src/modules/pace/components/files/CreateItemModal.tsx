'use client';

import { useMemo, useRef, useState } from 'react';
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
import { cn } from '@zamp-platform/ui/utils';
import type { CreateItemType } from '@/modules/pace/components/files/file-tree.types';
import { CREATE_ITEM_TYPE } from '@/modules/pace/components/files/file-tree.types';
import { getFileExtension } from '@/modules/pace/components/files/file-tree.utils';

interface CreateItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: CreateItemType;
  onCreate: (name: string) => void;
  existingNames?: string[];
}

const CreateItemModal = ({ isOpen, onOpenChange, itemType, onCreate, existingNames = [] }: CreateItemModalProps) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('');
    }
    onOpenChange(open);
  };

  const finalName = useMemo(() => {
    if (!name.trim()) return '';

    return itemType === CREATE_ITEM_TYPE.FILE
      ? getFileExtension(name)
        ? name.trim()
        : `${name.trim()}.txt`
      : name.trim();
  }, [name, itemType]);

  const isDuplicate = useMemo(() => {
    if (!finalName) return false;

    return existingNames.some((existingName) => existingName === finalName);
  }, [finalName, existingNames]);

  const handleCreate = () => {
    if (!name.trim() || isDuplicate) return;

    onCreate(finalName);
    handleOpenChange(false);
  };

  const isCreateDisabled = !name.trim() || isDuplicate;
  const title = itemType === CREATE_ITEM_TYPE.FILE ? 'New file' : 'New folder';
  const itemTypeLabel = itemType === CREATE_ITEM_TYPE.FILE ? 'file' : 'folder';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        size='small'
        showCloseButton
        className='w-[460px] rounded-[14px]'
        closeButtonClassName='top-5.5 right-5 cursor-pointer'
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader className='h-fit border-b-0 px-5 pt-5 pb-0'>
          <DialogHeaderTitle className='f-16-600'>{title}</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-5 pt-5 pb-6'>
          <div className='flex flex-col gap-y-2'>
            <label className='f-13-500 text-GRAY_1000'>Name</label>
            <Input
              ref={(el) => {
                inputRef.current = el;
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn('h-8', isDuplicate && 'border-RED_700! focus:shadow-input-error-outline-shadow')}
              placeholder='Type here'
              size='medium'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCreateDisabled) {
                  handleCreate();
                }
              }}
            />
            {isDuplicate && (
              <span className='f-11-400 text-RED_700 mt-2'>
                A {itemTypeLabel} or folder <span className='font-semibold'>{finalName}</span> already exists at this
                location. Please choose a different name.
              </span>
            )}
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
