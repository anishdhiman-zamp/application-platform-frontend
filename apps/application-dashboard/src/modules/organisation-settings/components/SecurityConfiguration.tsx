'use client';

import { useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown, Plus } from 'lucide-react';
import Image from 'next/image';
import { SettingsRow } from '@/modules/general/components/SettingsRow';
import ProviderCredentialsDialog from '@/modules/organisation-settings/components/ProviderCredentialsDialog';
import SecurityProviderDialog from '@/modules/organisation-settings/components/SecurityProviderDialog';
import { SECURITY_PROVIDERS } from '@/modules/organisation-settings/constants/organisation-settings.constants';
import {
  type ConfiguredProviderType,
  type SecurityProviderType,
} from '@/modules/organisation-settings/types/organisation-settings.types';

const SecurityConfiguration = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<SecurityProviderType | null>(null);
  const [configuredProviders, setConfiguredProviders] = useState<ConfiguredProviderType[]>([]);
  const [managingProvider, setManagingProvider] = useState<ConfiguredProviderType | null>(null);

  const handleSetupComplete = (configured: ConfiguredProviderType) => {
    setConfiguredProviders((prev) => {
      const exists = prev.findIndex((cp) => cp.provider.id === configured.provider.id);

      if (exists !== -1) {
        const updated = [...prev];

        updated[exists] = configured;

        return updated;
      }

      return [...prev, configured];
    });
    setSelectedProvider(null);
  };

  const trigger = (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='small' className='flex items-center gap-1.5'>
          <Plus className='h-3.5 w-3.5' />
          Add a security provider
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform duration-200', { isDropdownOpen: 'rotate-180' })}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='bg-BG_WHITE w-[var(--radix-dropdown-menu-trigger-width)]'>
        {SECURITY_PROVIDERS.map((provider) => (
          <DropdownMenuItem
            key={provider.id}
            className='f-12-450 hover:bg-BG_GRAY_2 flex cursor-pointer items-center gap-2.5 rounded-sm'
            onClick={() => setSelectedProvider(provider)}
          >
            <Image src={provider.icon} alt={provider.label} width={16} height={16} className='shrink-0' />
            {provider.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div className='flex flex-col'>
        <h1 className='f-20-600 text-GRAY_1000 pt-6 pb-4'>Security configuration</h1>
        <div className='border-GRAY_400 rounded-2xl border'>
          <SettingsRow
            label='Choose how people can login to Zamp'
            className={configuredProviders.length === 0 ? 'border-none' : ''}
            actionNode={trigger}
          />

          {configuredProviders.length > 0 && (
            <div className='divide-GRAY_400 divide-y'>
              {configuredProviders?.length > 0 &&
                configuredProviders?.map(({ provider, domains }) => (
                  <div key={provider.id} className='flex items-center justify-between px-4 py-3'>
                    <div className='flex flex-col gap-2.5'>
                      <div className='flex items-center gap-2'>
                        <Image src={provider.icon} alt={provider.label} width={14} height={14} className='shrink-0' />
                        <span className='f-12-500 text-GRAY_1000'>{provider.label}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        {domains.map((domain) => (
                          <span
                            key={domain.id}
                            className='f-12-450 text-GRAY_700 bg-BG_WHITE border-GRAY_400 rounded-md border px-2 py-0.5'
                          >
                            {domain.value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='small'
                      className='f-12-450'
                      onClick={() =>
                        setManagingProvider(configuredProviders.find((cp) => cp.provider.id === provider.id) ?? null)
                      }
                    >
                      Manage
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <SecurityProviderDialog
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onSetupComplete={handleSetupComplete}
      />

      <ProviderCredentialsDialog
        mode='manage'
        key={managingProvider?.provider.id ?? 'none'}
        configuredProvider={managingProvider}
        onClose={() => setManagingProvider(null)}
        onSave={(updated) => {
          setConfiguredProviders((prev) => prev.map((cp) => (cp.provider.id === updated.provider.id ? updated : cp)));
          setManagingProvider(null);
        }}
        onDisconnect={(providerId) => {
          setConfiguredProviders((prev) => prev.filter((cp) => cp.provider.id !== providerId));
          setManagingProvider(null);
        }}
      />
    </>
  );
};

export default SecurityConfiguration;
