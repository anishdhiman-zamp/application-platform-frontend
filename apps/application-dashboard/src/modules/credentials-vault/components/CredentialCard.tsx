'use client';

import { Button } from '@zamp-platform/ui';
import CredentialRow from '@/modules/credentials-vault/components/CredentialRow';
import type { CredentialCardPropsType } from '@/modules/credentials-vault/types/credentials-vault.types';

const CredentialCard = ({ credential, onManage }: CredentialCardPropsType) => {
  return (
    <div className='border-GRAY_400 bg-BG_WHITE flex flex-col overflow-hidden rounded-xl border'>
      <div className='border-GRAY_400 flex items-center justify-between border-b px-6 py-3.5'>
        <h3 className='f-13-500 text-GRAY_1000'>{credential.name}</h3>
        <Button variant='outline' size='small' onClick={() => onManage(credential)}>
          Manage
        </Button>
      </div>
      <div className='border-GRAY_400 flex items-center border-b px-6 py-2.5'>
        <span className='f-11-450 text-GRAY_700 min-w-0 flex-1 pr-4'>Key name</span>
        <span className='f-11-450 text-GRAY_700 min-w-0 flex-1'>Key value</span>
      </div>
      <div className='flex flex-col'>
        {credential?.keys?.map((key, idx) => (
          <CredentialRow
            key={key.id}
            credentialKey={key}
            className={idx !== credential?.keys?.length - 1 ? 'border-GRAY_400 border-b' : ''}
          />
        ))}
      </div>
    </div>
  );
};

export default CredentialCard;
