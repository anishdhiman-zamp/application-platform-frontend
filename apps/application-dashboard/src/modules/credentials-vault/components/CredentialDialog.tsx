'use client';

import { useState } from 'react';
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
  ScrollContainer,
} from '@zamp-platform/ui';
import { Plus, X } from 'lucide-react';
import CredentialKeyRow from '@/modules/credentials-vault/components/CredentialKeyRow';
import {
  CREDENTIAL_DIALOG_CONFIG,
  CREDENTIAL_DIALOG_MODE,
  DELETE_CREDENTIAL_DESCRIPTION,
} from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type {
  CredentialDialogPropsType,
  CredentialKeyFieldType,
  CredentialType,
} from '@/modules/credentials-vault/types/credentials-vault.types';
import {
  canSaveCredential,
  createEmptyCredential,
  createEmptyKey,
} from '@/modules/credentials-vault/utils/credentials-vault.utils';

const getInitialDraft = (
  mode: CredentialDialogPropsType['mode'],
  credential?: CredentialType | null,
): CredentialType => {
  if (mode === CREDENTIAL_DIALOG_MODE.MANAGE && credential) {
    return {
      id: credential?.id ?? '',
      name: credential?.name ?? '',
      keys: credential?.keys?.length ? credential?.keys : [createEmptyKey()],
    };
  }

  return createEmptyCredential();
};

const CredentialDialog = ({ mode, credential, onClose, onSave, onDelete }: CredentialDialogPropsType) => {
  // State
  const [draft, setDraft] = useState<CredentialType>(() => getInitialDraft(mode, credential));
  const [revealedKeyIds, setRevealedKeyIds] = useState<Set<string>>(new Set());

  // Derived State
  const isManage = mode === CREDENTIAL_DIALOG_MODE.MANAGE;
  const { title, primaryCta } = CREDENTIAL_DIALOG_CONFIG[mode];
  const canSave = canSaveCredential(draft);

  const handleNameChange = (value: string) => {
    setDraft((prev) => ({ ...prev, name: value }));
  };

  const handleKeyChange = (id: string, field: CredentialKeyFieldType, value: string) => {
    setDraft((prev) => ({
      ...prev,
      keys: prev?.keys?.map((key) => (key?.id === id ? { ...key, [field]: value } : key)) ?? [],
    }));
  };

  const handleAddKey = () => {
    setDraft((prev) => ({ ...prev, keys: [...prev.keys, createEmptyKey()] }));
  };

  const handleRemoveKey = (id: string) => {
    setDraft((prev) => {
      if (prev.keys.length <= 1) {
        return { ...prev, keys: [{ ...prev.keys[0], keyName: '', keyValue: '' }] };
      }

      return { ...prev, keys: prev?.keys?.filter((key) => key?.id !== id) ?? [] };
    });
  };

  const handleToggleReveal = (id: string) => {
    setRevealedKeyIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const handleSave = () => {
    const sanitized: CredentialType = {
      id: draft.id || crypto.randomUUID(),
      name: draft.name.trim(),
      keys: draft.keys
        .filter((key) => key.keyName.trim() && key.keyValue.trim())
        .map((key) => ({ ...key, keyName: key.keyName.trim(), keyValue: key.keyValue.trim() })),
    };

    onSave(sanitized);
    onClose();
  };

  const handleDelete = () => {
    if (isManage && credential && onDelete) {
      onDelete(credential.id);
    }
    onClose();
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
          <div className='flex flex-col gap-2 px-5'>
            <label htmlFor='credential-name' className='f-12-500 text-GRAY_900'>
              Credential name
            </label>
            <Input
              id='credential-name'
              value={draft.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder='Type name here'
              className='f-13-400 h-10 rounded-md shadow-none focus-visible:ring-0'
              autoFocus={!isManage}
            />
          </div>

          <div className='flex flex-col gap-3 pl-5'>
            <ScrollContainer className='flex max-h-[230px] flex-col gap-0 overflow-y-auto'>
              {draft.keys.map((key) => (
                <CredentialKeyRow
                  key={key.id}
                  credentialKey={key}
                  isRevealed={revealedKeyIds.has(key.id)}
                  onKeyChange={handleKeyChange}
                  onToggleReveal={handleToggleReveal}
                  onRemove={handleRemoveKey}
                />
              ))}
            </ScrollContainer>

            <Button
              variant='outline'
              size='xsmall'
              className='f-11-500 w-fit gap-1.5 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none'
              onClick={handleAddKey}
              leadingIcon={<Plus className='h-3 w-3' />}
            >
              Add another key
            </Button>
          </div>

          {isManage && credential && (
            <div className='border-GRAY_400 flex items-start justify-between gap-4 border-t px-5 pt-4'>
              <div className='flex min-w-0 flex-col gap-1'>
                <span className='f-12-500 text-GRAY_1000'>Delete credential</span>
                <span className='f-12-400 text-GRAY_700'>{DELETE_CREDENTIAL_DESCRIPTION}</span>
              </div>
              <Button variant='destructive-outline' size='small' className='shrink-0' onClick={handleDelete}>
                Delete credential
              </Button>
            </div>
          )}
        </DialogBody>

        <DialogFooter className='px-5 py-4'>
          <Button size='small' variant={isManage ? 'default' : 'outline'} disabled={!canSave} onClick={handleSave}>
            {primaryCta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialDialog;
