'use client';

import { Input } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { CREDENTIAL_KEY_FIELD } from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type {
  CredentialKeyFieldType,
  CredentialKeyType,
} from '@/modules/credentials-vault/types/credentials-vault.types';

interface CredentialKeyRowPropsType {
  credentialKey: CredentialKeyType;
  isRevealed: boolean;
  onKeyChange: (id: string, field: CredentialKeyFieldType, value: string) => void;
  onToggleReveal: (id: string) => void;
  onRemove: (id: string) => void;
}

const CredentialKeyRow = ({
  credentialKey,
  isRevealed,
  onKeyChange,
  onToggleReveal,
  onRemove,
}: CredentialKeyRowPropsType) => {
  return (
    <div className='mt-2 flex items-end gap-4 pr-5'>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <label className='f-12-500 text-GRAY_900'>Key name</label>
        <Input
          value={credentialKey.keyName}
          onChange={(e) => onKeyChange(credentialKey.id, CREDENTIAL_KEY_FIELD.KEY_NAME, e.target.value)}
          placeholder='e.g. webhook_secret'
          className='f-13-400 h-10 rounded-md shadow-none focus-visible:ring-0'
        />
      </div>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <label className='f-12-500 text-GRAY_900'>Key value</label>
        <div className='relative'>
          <Input
            value={credentialKey?.keyValue ?? ''}
            onChange={(e) => onKeyChange(credentialKey?.id ?? '', CREDENTIAL_KEY_FIELD.KEY_VALUE, e.target.value)}
            placeholder='Paste value here'
            type={isRevealed ? 'text' : 'password'}
            className={cn(
              'f-13-400 h-10 rounded-md pr-9 shadow-none focus-visible:ring-0',
              !isRevealed && credentialKey?.keyValue && 'tracking-wider',
            )}
          />
          {credentialKey?.keyValue && (
            <div
              role='button'
              aria-label={isRevealed ? 'Hide key value' : 'Show key value'}
              onClick={() => onToggleReveal(credentialKey?.id ?? '')}
              className='text-GRAY_700 hover:text-GRAY_1000 absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-0.5'
            >
              {isRevealed ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}
            </div>
          )}
        </div>
      </div>
      <div
        role='button'
        aria-label='Remove key'
        onClick={() => onRemove(credentialKey.id)}
        className='text-GRAY_700 hover:text-GRAY_1000 flex h-10 shrink-0 cursor-pointer items-center justify-center'
      >
        <span className='hover:bg-GRAY_100 flex items-center justify-center rounded-sm p-1.5'>
          <Trash2 className='h-3.5 w-3.5' />
        </span>
      </div>
    </div>
  );
};

export default CredentialKeyRow;
