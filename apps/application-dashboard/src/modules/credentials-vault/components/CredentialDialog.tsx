'use client';

import { useState } from 'react';
import {
  Button,
  ConfirmationDialog,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
} from '@zamp-platform/ui';
import { X } from 'lucide-react';
import CredentialDialogBody from '@/modules/credentials-vault/components/CredentialDialogBody';
import {
  CREDENTIAL_DIALOG_CONFIG,
  CREDENTIAL_DIALOG_MODE,
  DELETE_CREDENTIAL_DESCRIPTION,
} from '@/modules/credentials-vault/constants/credentials-vault.constants';
import { useCredentialDialog } from '@/modules/credentials-vault/hooks/useCredentialDialog';
import CredentialDialogSkeleton from '@/modules/credentials-vault/skeletons/CredentialDialogSkeleton';
import type { CredentialDialogPropsType } from '@/modules/credentials-vault/types/credentials-vault.types';

const CredentialDialog = ({ mode, credentialId, onClose }: CredentialDialogPropsType) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isManage = mode === CREDENTIAL_DIALOG_MODE.MANAGE;
  const { title, primaryCta } = CREDENTIAL_DIALOG_CONFIG[mode];

  const {
    draft,
    revealedKeyIds,
    persistedKeyIds,
    errors,
    lastAddedKeyId,
    isFetching,
    isSaving,
    isDeleting,
    handleNameChange,
    handleKeyChange,
    handleAddKey,
    handleRemoveKey,
    handleToggleReveal,
    handleSave,
    handleDelete,
  } = useCredentialDialog({ mode, credentialId, onClose });

  const isLoadingCredential = isManage && isFetching;

  const handleOpenDeleteConfirm = () => setIsDeleteConfirmOpen(true);
  const handleConfirmDelete = () => {
    setIsDeleteConfirmOpen(false);
    handleDelete();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent size='small' showCloseButton={false} className='max-h-[80vh] w-[522px] rounded-xl' title={title}>
        <DialogHeader className='border-none p-5'>
          <DialogHeaderTitle className='f-14-550 text-GRAY_1000'>{title}</DialogHeaderTitle>
          <DialogClose onClick={onClose} className='cursor-pointer'>
            <X className='text-GRAY_700 h-3.5 w-3.5' />
          </DialogClose>
        </DialogHeader>

        <DialogBody className='flex flex-col gap-6 pt-0 pb-6'>
          {isLoadingCredential ? (
            <CredentialDialogSkeleton showDeleteSection={isManage} />
          ) : (
            <CredentialDialogBody
              draft={draft}
              revealedKeyIds={revealedKeyIds}
              persistedKeyIds={persistedKeyIds}
              errors={errors}
              lastAddedKeyId={lastAddedKeyId}
              isManage={isManage}
              isSaving={isSaving}
              isDeleting={isDeleting}
              credentialId={credentialId}
              onNameChange={handleNameChange}
              onKeyChange={handleKeyChange}
              onAddKey={handleAddKey}
              onRemoveKey={handleRemoveKey}
              onToggleReveal={handleToggleReveal}
              onOpenDeleteConfirm={handleOpenDeleteConfirm}
            />
          )}
        </DialogBody>

        <DialogFooter className='px-5 py-4'>
          <Button
            size='small'
            variant={isManage ? 'default' : 'outline'}
            disabled={isLoadingCredential || isDeleting || isSaving}
            isLoading={isSaving}
            onClick={handleSave}
          >
            {primaryCta}
          </Button>
        </DialogFooter>
      </DialogContent>
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title='Delete credential?'
        description={DELETE_CREDENTIAL_DESCRIPTION}
        confirmLabel='Delete'
        cancelLabel='Cancel'
        confirmVariant='destructive'
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </Dialog>
  );
};

export default CredentialDialog;
