'use client';

import { Button, Input, ScrollContainer } from '@zamp-platform/ui';
import { Plus } from 'lucide-react';
import CredentialKeyRow from '@/modules/credentials-vault/components/CredentialKeyRow';
import { DELETE_CREDENTIAL_DESCRIPTION } from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type {
  CredentialDraftErrorsType,
  CredentialKeyFieldType,
  CredentialType,
} from '@/modules/credentials-vault/types/credentials-vault.types';
import type { defaultFnType } from '@/types/commonTypes';

interface CredentialDialogBodyPropsType {
  draft: CredentialType;
  revealedKeyIds: Set<string>;
  persistedKeyIds: Set<string>;
  errors: CredentialDraftErrorsType;
  lastAddedKeyId: string | null;
  isManage: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  credentialId?: string | null;
  onNameChange: (value: string) => void;
  onKeyChange: (id: string, field: CredentialKeyFieldType, value: string) => void;
  onAddKey: defaultFnType;
  onRemoveKey: (id: string) => void;
  onToggleReveal: (id: string) => void;
  onOpenDeleteConfirm: defaultFnType;
}

const CredentialDialogBody = ({
  draft,
  revealedKeyIds,
  persistedKeyIds,
  errors,
  lastAddedKeyId,
  isManage,
  isSaving,
  isDeleting,
  credentialId,
  onNameChange,
  onKeyChange,
  onAddKey,
  onRemoveKey,
  onToggleReveal,
  onOpenDeleteConfirm,
}: CredentialDialogBodyPropsType) => (
  <>
    <div className='flex flex-col gap-2 px-5'>
      <label htmlFor='credential-name' className='f-12-500 text-GRAY_900'>
        Credential name
      </label>
      <Input
        id='credential-name'
        value={draft.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder='Type name here'
        className='f-13-400 h-10 rounded-md shadow-none focus-visible:ring-0'
        error={errors.name}
        autoFocus={!isManage}
      />
    </div>

    <div className='flex flex-col gap-3 pl-5'>
      <ScrollContainer className='flex max-h-[230px] flex-col gap-0 overflow-y-auto' scrollTrigger={draft.keys.length}>
        {draft.keys.map((key) => (
          <CredentialKeyRow
            key={key.id}
            credentialKey={key}
            isRevealed={revealedKeyIds.has(key.id)}
            isPersisted={persistedKeyIds.has(key.id)}
            errors={errors.keys[key.id]}
            autoFocusKeyName={key.id === lastAddedKeyId}
            onKeyChange={onKeyChange}
            onToggleReveal={onToggleReveal}
            onRemove={onRemoveKey}
          />
        ))}
      </ScrollContainer>

      <Button
        variant='outline'
        size='xsmall'
        className='f-11-500 w-fit gap-1.5 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none'
        onClick={onAddKey}
        leadingIcon={<Plus className='h-3 w-3' />}
      >
        Add another key
      </Button>
    </div>

    {isManage && credentialId && (
      <div className='flex flex-col px-5'>
        <div className='border-GRAY_400 flex items-center border-b' />
        <div className='flex items-start justify-between gap-4 pt-4'>
          <div className='flex min-w-0 flex-col gap-1'>
            <span className='f-12-500 text-GRAY_1000'>Delete credential</span>
            <span className='f-12-400 text-GRAY_700'>{DELETE_CREDENTIAL_DESCRIPTION}</span>
          </div>
          <Button
            variant='destructive-outline'
            size='small'
            className='mt-3 shrink-0'
            onClick={onOpenDeleteConfirm}
            disabled={isDeleting || isSaving}
            isLoading={isDeleting}
          >
            Delete credential
          </Button>
        </div>
      </div>
    )}
  </>
);

export default CredentialDialogBody;
