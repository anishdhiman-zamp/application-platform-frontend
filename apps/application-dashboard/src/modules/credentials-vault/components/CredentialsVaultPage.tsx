'use client';

import { useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { Plus } from 'lucide-react';
import CredentialCard from '@/modules/credentials-vault/components/CredentialCard';
import CredentialDialog from '@/modules/credentials-vault/components/CredentialDialog';
import { CREDENTIAL_DIALOG_MODE } from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type {
  CredentialDialogModeType,
  CredentialType,
} from '@/modules/credentials-vault/types/credentials-vault.types';

const CredentialsVaultPage = () => {
  // State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState<CredentialType[]>([]);
  const [dialogMode, setDialogMode] = useState<CredentialDialogModeType>(CREDENTIAL_DIALOG_MODE.ADD);
  const [activeCredential, setActiveCredential] = useState<CredentialType | null>(null);

  // Handlers
  const handleOpenAdd = () => {
    setActiveCredential(null);
    setDialogMode(CREDENTIAL_DIALOG_MODE.ADD);
    setIsDialogOpen(true);
  };

  const handleOpenManage = (credential: CredentialType) => {
    setActiveCredential(credential);
    setDialogMode(CREDENTIAL_DIALOG_MODE.MANAGE);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setActiveCredential(null);
  };

  const handleSave = (next: CredentialType) => {
    setCredentials((prev) => {
      const idx = prev.findIndex((c) => c.id === next.id);

      if (idx === -1) return [...prev, next];

      const updated = [...prev];

      updated[idx] = next;

      return updated;
    });
  };

  const handleDelete = (id: string) => {
    setCredentials((prev) => prev?.filter((c) => c?.id !== id) ?? []);
  };

  // Render
  return (
    <div className='flex h-full w-full flex-1 flex-col overflow-auto'>
      <div className='flex w-full flex-col gap-4'>
        <div className='flex items-baseline gap-1'>
          <h1 className='f-16-500 text-GRAY_1000'>Credentials Vault</h1>
          <span className='f-16-500 text-GRAY_700'>{credentials.length}</span>
        </div>

        <div className='border-GRAY_400 bg-BG_WHITE flex flex-col overflow-hidden rounded-xl border'>
          <div className='flex items-center justify-between px-6 py-3.5'>
            <p className='f-12-500 text-GRAY_700'>Store API keys for your agents to use</p>
            <Button
              variant='outline'
              size='small'
              onClick={handleOpenAdd}
              leadingIcon={<Plus className='h-3.5 w-3.5' />}
            >
              Add credential
            </Button>
          </div>
        </div>

        {credentials.map((credential) => (
          <CredentialCard key={credential.id} credential={credential} onManage={handleOpenManage} />
        ))}
      </div>

      {isDialogOpen && (
        <CredentialDialog
          mode={dialogMode}
          credential={activeCredential}
          onClose={handleCloseDialog}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default CredentialsVaultPage;
