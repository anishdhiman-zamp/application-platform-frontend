'use client';

import { useMemo, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { MASK_CHAR, MASK_LENGTH } from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type { CredentialRowPropsType } from '@/modules/credentials-vault/types/credentials-vault.types';
import { useCopyToClipboard } from '@/modules/general/hooks/useCopyToClipboard';

const CredentialRow = ({ credentialKey, className }: CredentialRowPropsType) => {
  // State
  const [isRevealed, setIsRevealed] = useState(false);

  // Hooks
  const { copied, handleCopy } = useCopyToClipboard(credentialKey.keyValue);

  // Derived State
  const displayValue = useMemo(() => {
    if (isRevealed) return credentialKey.keyValue;

    return MASK_CHAR.repeat(MASK_LENGTH);
  }, [isRevealed, credentialKey.keyValue]);

  // Render
  return (
    <div className={cn('flex items-center justify-between px-6 py-3.5', className)}>
      <div className='f-12-500 text-GRAY_1000 min-w-0 flex-1 truncate pr-4'>{credentialKey?.keyName ?? ''}</div>
      <div className='flex min-w-0 flex-1 items-center justify-between gap-2'>
        <span className='f-12-500 text-GRAY_700 min-w-0 flex-1 truncate font-mono tracking-wider'>
          {displayValue ?? ''}
        </span>
        <div className='flex shrink-0 items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            aria-label={isRevealed ? 'Hide key value' : 'Show key value'}
            className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 p-0'
            onClick={() => setIsRevealed((prev) => !prev)}
          >
            {isRevealed ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Copy key value'
            className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 p-0'
            onClick={handleCopy}
          >
            {copied ? <Check className='text-GREEN_600 h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CredentialRow;
