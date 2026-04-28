'use client';

import { useState } from 'react';
import { Button, toast, TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  CREDENTIAL_TOAST_MESSAGE,
  MASKED_VALUE,
} from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type { CredentialRowPropsType } from '@/modules/credentials-vault/types/credentials-vault.types';

const COPY_RESET_MS = 2000;

const CredentialRow = ({
  credentialKey,
  isRevealed,
  isRevealing,
  isCopying,
  resolvedValue,
  className,
  onToggleReveal,
  onResolveValue,
}: CredentialRowPropsType) => {
  const [copied, setCopied] = useState(false);

  const displayValue = isRevealed && resolvedValue ? resolvedValue : MASKED_VALUE;

  const handleToggleReveal = () => onToggleReveal(credentialKey?.keyName ?? '');

  const handleCopy = () => {
    onResolveValue(credentialKey?.keyName ?? '').then((value) => {
      if (!value) {
        toast.error(CREDENTIAL_TOAST_MESSAGE.COPY_FAILURE);

        return;
      }

      navigator.clipboard
        .writeText(value)
        .then(() => {
          setCopied(true);
          toast.success(CREDENTIAL_TOAST_MESSAGE.COPY_SUCCESS);
          setTimeout(() => setCopied(false), COPY_RESET_MS);
        })
        .catch(() => {
          toast.error(CREDENTIAL_TOAST_MESSAGE.COPY_FAILURE);
        });
    });
  };

  const renderRevealIcon = () => {
    if (isRevealing) return <Loader2 className='h-3.5 w-3.5 animate-spin' />;
    if (isRevealed) return <EyeOff className='h-3.5 w-3.5' />;

    return <Eye className='h-3.5 w-3.5' />;
  };

  const renderCopyIcon = () => {
    if (isCopying) return <Loader2 className='h-3.5 w-3.5 animate-spin' />;
    if (copied) return <Check className='text-GREEN_600 h-3.5 w-3.5' />;

    return <Copy className='h-3.5 w-3.5' />;
  };

  return (
    <div className={cn('flex items-center justify-between py-3', className)}>
      <div className='f-13-400 text-GRAY_1000 min-w-0 flex-1 truncate pr-4'>{credentialKey?.keyName ?? ''}</div>
      <div className='flex min-w-0 flex-1 items-center justify-between gap-2'>
        <span className='f-12-500 text-GRAY_700 min-w-0 flex-1 truncate font-mono tracking-wider'>{displayValue}</span>
        <div className='flex shrink-0 items-center gap-1'>
          <TooltipV2 tooltipBody={isRevealed ? 'Hide' : 'Show'} asChildTrigger>
            <Button
              variant='ghost'
              size='icon'
              aria-label={isRevealed ? 'Hide key value' : 'Show key value'}
              className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 p-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              onClick={handleToggleReveal}
              disabled={isRevealing}
            >
              {renderRevealIcon()}
            </Button>
          </TooltipV2>
          <TooltipV2 tooltipBody={copied ? 'Copied' : 'Copy'} asChildTrigger>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Copy key value'
              className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 p-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              onClick={handleCopy}
              disabled={isCopying}
            >
              {renderCopyIcon()}
            </Button>
          </TooltipV2>
        </div>
      </div>
    </div>
  );
};

export default CredentialRow;
