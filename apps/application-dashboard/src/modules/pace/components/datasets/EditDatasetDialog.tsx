'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Input,
  toast,
} from '@zamp-platform/ui';
import {
  buildCommentOnTableQuery,
  buildRenameTableQuery,
  sanitizeTableName,
} from 'modules/pace/components/datasets/datasets.constants';
import { type AgentDbQueryRequest, useUpdateDatasetMetaMutation } from '@/apis/agentManagedDb';

interface EditDatasetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  description: string;
  existingTableNames: Set<string>;
  listingQueryArg: AgentDbQueryRequest;
  onSuccess: () => void;
}

const EditDatasetDialog: FC<EditDatasetDialogProps> = ({
  isOpen,
  onOpenChange,
  tableName,
  description,
  existingTableNames,
  listingQueryArg,
  onSuccess,
}) => {
  const [newName, setNewName] = useState(tableName);
  const [newDescription, setNewDescription] = useState(description);
  const [updateMeta, { isLoading }] = useUpdateDatasetMetaMutation();

  useEffect(() => {
    if (isOpen) {
      setNewName(tableName);
      setNewDescription(description);
    }
  }, [isOpen, tableName, description]);

  const handleSave = useCallback(async () => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      toast.error('Table name cannot be empty');

      return;
    }

    const sanitized = sanitizeTableName(trimmedName);

    if (sanitized !== tableName && existingTableNames.has(sanitized)) {
      toast.error('A dataset with this name already exists');

      return;
    }

    const trimmedDesc = newDescription.trim();
    const queries: string[] = [];

    if (sanitized !== tableName) {
      queries.push(buildRenameTableQuery(tableName, sanitized));
    }
    if (trimmedDesc !== description) {
      queries.push(buildCommentOnTableQuery(tableName, trimmedDesc));
    }

    if (queries.length === 0) return;

    try {
      await updateMeta({
        oldTableName: tableName,
        newTableName: sanitized,
        newDescription: trimmedDesc,
        oldDescription: description,
        listingQueryArg,
        queries,
      }).unwrap();

      toast.success('Dataset updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error('Failed to update dataset');
    }
  }, [
    newName,
    newDescription,
    tableName,
    description,
    existingTableNames,
    updateMeta,
    listingQueryArg,
    onSuccess,
    onOpenChange,
  ]);

  const hasChanges = sanitizeTableName(newName.trim()) !== tableName || newDescription.trim() !== description;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='medium' showCloseButton className='w-[520px]'>
        <DialogHeader>
          <DialogHeaderTitle>Edit dataset</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='flex flex-col gap-4 p-5'>
          <Input
            placeholder='New table name'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className='text-GRAY_1000'
          />
          <textarea
            placeholder='New table description'
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={4}
            className='border-GRAY_400 text-GRAY_1000 f-13-400 focus:border-GRAY_700 w-full resize-y rounded-md border px-3 py-2 transition-colors outline-none'
          />
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium'>
              Cancel
            </Button>
          </DialogClose>
          <Button size='medium' onClick={handleSave} disabled={isLoading || !hasChanges}>
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDatasetDialog;
