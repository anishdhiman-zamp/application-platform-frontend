'use client';

import { useMemo, useState } from 'react';
import { Button, ScrollContainer } from '@zamp-platform/ui';
import { Plus } from 'lucide-react';
import { useGetCredentialsQuery } from '@/apis/credentials';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import CredentialCard from '@/modules/credentials-vault/components/CredentialCard';
import CredentialDialog from '@/modules/credentials-vault/components/CredentialDialog';
import CredentialsEmptyState from '@/modules/credentials-vault/components/CredentialsEmptyState';
import {
  CREDENTIAL_DIALOG_MODE,
  DEFAULT_VAULT_CREDENTIAL_PURPOSE,
  DEFAULT_VAULT_LIMIT,
  DEFAULT_VAULT_PAGE,
} from '@/modules/credentials-vault/constants/credentials-vault.constants';
import CredentialsListSkeleton from '@/modules/credentials-vault/skeletons/CredentialsListSkeleton';
import type {
  CredentialDialogModeType,
  CredentialType,
} from '@/modules/credentials-vault/types/credentials-vault.types';
import { mapApiCredentialToUi } from '@/modules/credentials-vault/utils/credentials-vault.utils';

const CredentialsVaultPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CredentialDialogModeType>(CREDENTIAL_DIALOG_MODE.ADD);
  const [activeCredentialId, setActiveCredentialId] = useState<string | null>(null);

  const { data, isLoading } = useGetCredentialsQuery({
    credential_purpose: DEFAULT_VAULT_CREDENTIAL_PURPOSE,
    page: DEFAULT_VAULT_PAGE,
    limit: DEFAULT_VAULT_LIMIT,
  });

  const credentials = useMemo<CredentialType[]>(
    () => data?.credentials?.map(mapApiCredentialToUi) ?? [],
    [data?.credentials],
  );
  const isEmpty = !isLoading && credentials.length === 0;

  const handleOpenAdd = () => {
    setActiveCredentialId(null);
    setDialogMode(CREDENTIAL_DIALOG_MODE.ADD);
    setIsDialogOpen(true);
  };

  const handleOpenManage = (credential: CredentialType) => {
    setActiveCredentialId(credential.id);
    setDialogMode(CREDENTIAL_DIALOG_MODE.MANAGE);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setActiveCredentialId(null);
  };

  return (
    <div className='flex h-full w-full flex-1 flex-col'>
      <div className='flex items-baseline gap-1.5 pt-2 pb-8'>
        <h1 className='f-20-600 text-GRAY_1000'>Credentials Vault</h1>
        <span className='f-20-600 text-GRAY_700'>{credentials?.length}</span>
      </div>

      <div className='border-GRAY_400 bg-BG_WHITE mb-4 flex flex-col overflow-hidden rounded-xl border'>
        <div className='flex items-center justify-between px-6 py-3.5'>
          <p className='f-12-500 text-GRAY_700'>Store API keys for your agents to use</p>
          <Button variant='outline' size='small' onClick={handleOpenAdd} leadingIcon={<Plus className='h-3.5 w-3.5' />}>
            Add credential
          </Button>
        </div>
      </div>

      <ScrollContainer className='flex-1' scrollClassName='pb-6' scrollbarStyle='none'>
        <CommonWrapper
          isLoading={isLoading}
          isNoData={isEmpty}
          noDataBanner={<CredentialsEmptyState />}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<CredentialsListSkeleton />}
          className='flex h-full flex-col gap-4'
          disableAnimation
        >
          {credentials.map((credential) => (
            <CredentialCard key={credential.id} credential={credential} onManage={handleOpenManage} />
          ))}
        </CommonWrapper>
      </ScrollContainer>

      {isDialogOpen && (
        <CredentialDialog mode={dialogMode} credentialId={activeCredentialId} onClose={handleCloseDialog} />
      )}
    </div>
  );
};

export default CredentialsVaultPage;
