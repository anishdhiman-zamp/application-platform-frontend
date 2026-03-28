'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
} from '@zamp-platform/ui';
import { ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import ProviderCredentialsDialog from '@/modules/organisation-settings/components/ProviderCredentialsDialog';
import { SECURITY_PROVIDER_STEPS } from '@/modules/organisation-settings/constants/organisation-settings.constants';
import { type SecurityProviderDialogPropsType } from '@/modules/organisation-settings/types/organisation-settings.types';

const SecurityProviderDialog = ({ provider, onClose, onSetupComplete }: SecurityProviderDialogPropsType) => {
  const [showCredentials, setShowCredentials] = useState(false);
  const steps = provider ? (SECURITY_PROVIDER_STEPS[provider.id] ?? []) : [];

  const handleContinue = () => {
    setShowCredentials(true);
  };

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    onClose();
  };

  const handleClose = () => {
    setShowCredentials(false);
    onClose();
  };

  return (
    <>
      <Dialog open={!!provider && !showCredentials} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          size='large'
          showCloseButton={false}
          className='h-[580px] max-h-[580px] w-[80vw]'
          title={provider ? `Setup ${provider.label}` : 'Setup'}
        >
          <DialogHeader>
            <DialogHeaderTitle className='flex items-center gap-2'>
              {provider && (
                <Image src={provider.icon} alt={provider.label} width={18} height={18} className='shrink-0' />
              )}
              Setup {provider?.label}
            </DialogHeaderTitle>
            <DialogClose onClick={handleClose} className='cursor-pointer'>
              <X className='text-GRAY_700 h-4 w-4' />
            </DialogClose>
          </DialogHeader>

          <DialogBody className='flex min-h-0 flex-row overflow-hidden'>
            {/* Left: steps */}
            <div className='flex w-1/2 flex-col gap-6 overflow-y-auto p-8'>
              {steps.map(({ step, description }) => (
                <div key={step} className='flex gap-4'>
                  <span className='text-GRAY_950 f-14-400 mt-0.5 w-4 shrink-0'>{step}</span>
                  <p className='f-14-400 text-GRAY_1000'>{description}</p>
                </div>
              ))}
            </div>

            {/* Right: video */}
            <div className='flex w-1/2 items-center justify-center'>
              <video className='h-full w-full object-cover' controls playsInline src=''>
                Your browser does not support the video tag.
              </video>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button size='small' className='f-12-500 flex items-center gap-2' onClick={handleContinue}>
              <ArrowRight className='h-3.5 w-3.5' />
              Continue to add credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProviderCredentialsDialog
        mode='add'
        provider={showCredentials ? provider : null}
        onClose={handleCredentialsClose}
        onBack={() => setShowCredentials(false)}
        onSetupComplete={(configured) => {
          onSetupComplete(configured);
          handleCredentialsClose();
        }}
      />
    </>
  );
};

export default SecurityProviderDialog;
