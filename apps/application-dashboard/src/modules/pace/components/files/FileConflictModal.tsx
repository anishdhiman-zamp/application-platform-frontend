'use client';

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
} from '@zamp-platform/ui';
import { AlertTriangle } from 'lucide-react';
import {
  CONFLICT_RESOLUTION,
  type ConflictResolution,
  type FileConflict,
} from '@/modules/pace/components/files/file-tree.types';

interface FileConflictModalProps {
  isOpen: boolean;
  conflict: FileConflict | null;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
}

const FileConflictModal = ({ isOpen, conflict, onResolve, onCancel }: FileConflictModalProps) => {
  if (!conflict) return null;

  const operationLabel = conflict.operation === 'move' ? 'moving' : 'copying';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent size='small' showCloseButton={true} className='w-[460px] rounded-[14px]'>
        <DialogHeader className='h-fit border-b-0 px-5 pt-5 pb-0'>
          <div className='flex items-center gap-3'>
            <div className='bg-YELLOW_100 flex size-10 items-center justify-center rounded-full'>
              <AlertTriangle className='text-YELLOW_700 size-5' />
            </div>
            <DialogHeaderTitle className='f-16-600'>Item already exists</DialogHeaderTitle>
          </div>
        </DialogHeader>
        <DialogBody className='p-5 pt-4 pb-6'>
          <p className='f-14-400 text-GRAY_700'>
            An item named <span className='text-GRAY_1000 font-semibold'>"{conflict.sourceName}"</span> already exists
            in this location. Do you want to replace it with the one you're {operationLabel}?
          </p>
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5 border-t-0 p-5 pt-0'>
          <Button variant='outline' size='medium' onClick={() => onResolve(CONFLICT_RESOLUTION.KEEP_BOTH)}>
            Keep Both
          </Button>
          <Button variant='default' size='medium' onClick={() => onResolve(CONFLICT_RESOLUTION.REPLACE)}>
            Replace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileConflictModal;
