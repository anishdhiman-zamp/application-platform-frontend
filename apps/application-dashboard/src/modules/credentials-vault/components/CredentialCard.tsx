'use client';

import { Button, TooltipV2 } from '@zamp-platform/ui';
import { SquarePen } from 'lucide-react';
import CredentialColumnHeader from '@/modules/credentials-vault/components/CredentialColumnHeader';
import CredentialRow from '@/modules/credentials-vault/components/CredentialRow';
import ShareCredentialPopup from '@/modules/credentials-vault/components/ShareCredentialPopup';
import { useCredentialReveal } from '@/modules/credentials-vault/hooks/useCredentialReveal';
import type { CredentialCardPropsType } from '@/modules/credentials-vault/types/credentials-vault.types';

const CredentialCard = ({ credential, onManage }: CredentialCardPropsType) => {
  const {
    revealedKeyNames,
    revealingKeyNames,
    copyingKeyNames,
    decryptedBody,
    handleToggleReveal,
    handleResolveValue,
  } = useCredentialReveal({
    credentialId: credential.id,
  });

  const handleManage = () => onManage(credential);

  return (
    <div className='border-GRAY_400 bg-BG_WHITE flex shrink-0 flex-col overflow-hidden rounded-xl border px-6'>
      <div className='flex items-center justify-between pt-5.5'>
        <h3 className='f-13-500 text-GRAY_1000'>{credential?.name ?? ''}</h3>
        <div className='flex items-center gap-1'>
          <ShareCredentialPopup credentialId={credential?.id ?? ''} />
          <TooltipV2 tooltipBody='Manage' asChildTrigger>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Manage credential'
              className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 p-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              onClick={handleManage}
            >
              <SquarePen className='h-3.5 w-3.5' />
            </Button>
          </TooltipV2>
        </div>
      </div>
      <CredentialColumnHeader />
      <div className='flex flex-col'>
        {credential?.keys?.map((key) => (
          <CredentialRow
            key={key.id}
            credentialKey={key}
            isRevealed={revealedKeyNames.has(key.keyName)}
            isRevealing={revealingKeyNames.has(key.keyName)}
            isCopying={copyingKeyNames.has(key.keyName)}
            resolvedValue={decryptedBody?.[key.keyName]}
            onToggleReveal={handleToggleReveal}
            onResolveValue={handleResolveValue}
          />
        ))}
      </div>
    </div>
  );
};

export default CredentialCard;
