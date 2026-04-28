'use client';

import { useState } from 'react';
import { ConfirmationDialog, Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { CREDENTIAL_KEY_FIELD, MASKED_VALUE } from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type {
  CredentialKeyErrorsType,
  CredentialKeyFieldType,
  CredentialKeyType,
} from '@/modules/credentials-vault/types/credentials-vault.types';

interface CredentialKeyRowPropsType {
  credentialKey: CredentialKeyType;
  isRevealed: boolean;
  isPersisted: boolean;
  errors?: CredentialKeyErrorsType;
  autoFocusKeyName?: boolean;
  onKeyChange: (id: string, field: CredentialKeyFieldType, value: string) => void;
  onToggleReveal: (id: string) => void;
  onRemove: (id: string) => void;
}

const CredentialKeyRow = ({
  credentialKey,
  isRevealed,
  isPersisted,
  errors,
  autoFocusKeyName,
  onKeyChange,
  onToggleReveal,
  onRemove,
}: CredentialKeyRowPropsType) => {
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);

  const hasValue = !!credentialKey?.keyValue;
  const isFixedMasked = isPersisted && hasValue && !isRevealed;
  const showInputAsPassword = !isPersisted && !isRevealed && hasValue;

  const displayValue = isFixedMasked ? MASKED_VALUE : (credentialKey?.keyValue ?? '');

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFixedMasked) return;

    onKeyChange(credentialKey?.id ?? '', CREDENTIAL_KEY_FIELD.KEY_VALUE, e.target.value);
  };

  const handleConfirmRemove = () => {
    setIsRemoveConfirmOpen(false);
    onRemove(credentialKey.id);
  };

  return (
    <div className='mt-2 flex items-start gap-4 pr-5'>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <label className='f-12-500 text-GRAY_900'>Key name</label>
        <Input
          value={credentialKey.keyName}
          onChange={(e) => onKeyChange(credentialKey.id, CREDENTIAL_KEY_FIELD.KEY_NAME, e.target.value)}
          placeholder='e.g. webhook_secret'
          className='f-13-400 h-10 rounded-md shadow-none focus-visible:ring-0'
          error={errors?.keyName}
          autoFocus={autoFocusKeyName}
        />
      </div>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <label className='f-12-500 text-GRAY_900'>Key value</label>
        <div className='relative'>
          <Input
            value={displayValue}
            onChange={handleValueChange}
            placeholder='Paste value here'
            type={showInputAsPassword ? 'password' : 'text'}
            readOnly={isFixedMasked}
            className={cn(
              'f-13-400 h-10 rounded-md pr-9 shadow-none focus-visible:ring-0',
              isFixedMasked && 'font-mono tracking-wider',
              showInputAsPassword && hasValue && 'tracking-wider',
            )}
            error={errors?.keyValue}
          />
          {hasValue && (
            <div
              role='button'
              aria-label={isRevealed ? 'Hide key value' : 'Show key value'}
              onClick={() => onToggleReveal(credentialKey?.id ?? '')}
              className='text-GRAY_700 hover:text-GRAY_1000 absolute top-5 right-2.5 -translate-y-1/2 cursor-pointer p-0.5'
            >
              {isRevealed ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}
            </div>
          )}
        </div>
      </div>
      <div className='flex shrink-0 flex-col gap-2'>
        <span className='f-12-500 invisible' aria-hidden>
          .
        </span>
        <div
          role='button'
          aria-label='Remove key'
          onClick={() => setIsRemoveConfirmOpen(true)}
          className='text-GRAY_700 hover:text-GRAY_1000 flex h-10 cursor-pointer items-center justify-center'
        >
          <span className='hover:bg-GRAY_100 flex items-center justify-center rounded-sm p-1.5'>
            <Trash2 className='h-3.5 w-3.5' />
          </span>
        </div>
      </div>
      <ConfirmationDialog
        open={isRemoveConfirmOpen}
        onOpenChange={setIsRemoveConfirmOpen}
        title='Remove key?'
        description={
          credentialKey?.keyName ? (
            <>
              <span className='text-GRAY_1000 font-medium'>{credentialKey.keyName}</span> will be removed from the
              credential.
            </>
          ) : (
            'This key will be removed from the credential.'
          )
        }
        confirmLabel='Remove'
        cancelLabel='Cancel'
        confirmVariant='destructive'
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
};

export default CredentialKeyRow;
