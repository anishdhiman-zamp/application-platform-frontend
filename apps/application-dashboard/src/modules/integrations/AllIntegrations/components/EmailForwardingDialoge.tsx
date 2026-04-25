'use client';

import { type FC, useMemo, useRef, useState } from 'react';
import { FormBuilder, type FormBuilderRef } from '@zamp-platform/form-builder';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  toast,
} from '@zamp-platform/ui';
import { generateFormSections } from 'modules/integrations/components/utils';
import { useParams } from 'next/navigation';
import { useAuthenticateIntegrationMutation } from '@/apis/integrations';
import { useProcesses } from '@/contexts/ProcessesContext';
import { useAppSelector } from '@/hooks/toolkit';
import { AUTH_TYPE, type EmailForwardingDialogPropsType } from '@/modules/integrations/types/integrations.types';
import type { RootState } from '@/store';
import { getNameInitial } from '@/utils/common';

const EmailForwardingDialog: FC<EmailForwardingDialogPropsType> = ({
  integration,
  isOpen,
  onClose,
  isCreatingTrigger = false,
  onSubmit,
  animated = false,
}) => {
  const params = useParams();
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name);
  const formRef = useRef<FormBuilderRef>(null);
  const [authenticateIntegration, { isLoading: isAuthenticating }] = useAuthenticateIntegrationMutation();
  const { processes } = useProcesses();

  const { title, icon, name, auth } = integration;
  const [error, setError] = useState<string>('');
  const [imgError, setImgError] = useState<boolean>(false);

  const currentProcess = useMemo(
    () => processes?.find((process) => process.process_id === params?.processId),
    [processes, params?.processId],
  );

  const handleSetupConnection = () => {
    formRef.current?.submit();
  };

  const handleFormSubmit = (data: Record<string, string>) => {
    setError('');

    authenticateIntegration({
      integration_name: integration.name,
      auth_type: AUTH_TYPE.CUSTOM,
      credentials: data,
    })
      .unwrap()
      .then((response) => {
        if (onSubmit) {
          onSubmit(response.id);
        } else {
          onClose();
          toast.success('Integration authenticated successfully');
        }
      })
      .catch((error) => {
        setError(error?.data?.message);
      });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className='border-GRAY_300 bg-BG_WHITE h-auto max-h-150 w-115 max-w-115 rounded-xl border'
        title={`New connection for ${title}`}
        description='Set up a new connection for this integration'
        showCloseButton
      >
        <DialogHeader>
          <DialogHeaderTitle className='f-14-550 text-GRAY_1000 flex items-center gap-2'>
            <span>New connection for</span>
            <span className='relative flex h-5 w-5 shrink-0 items-center justify-center'>
              {imgError || !icon ? (
                <span className='bg-GRAY_200 text-GRAY_700 f-11-550 flex h-full w-full items-center justify-center rounded'>
                  {getNameInitial(title)}
                </span>
              ) : (
                <img src={icon} alt={title} className='h-4.5 w-4.5 object-contain' onError={() => setImgError(true)} />
              )}
            </span>
            <span>{title}</span>
          </DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='flex flex-col gap-y-4 px-4 py-4'>
          {auth.length > 0 && (
            <FormBuilder
              ref={formRef}
              schema={generateFormSections(name, auth[0], orgName, currentProcess?.display_name)}
              onSubmit={handleFormSubmit}
              animated={animated}
            />
          )}
          {error && <div className='f-13-450 text-red-900'>{error}</div>}
        </DialogBody>

        <DialogFooter className='flex items-center justify-end px-6 py-4'>
          <Button
            variant='default'
            size='small'
            onClick={handleSetupConnection}
            className='f-12-500 px-3'
            isLoading={isCreatingTrigger || isAuthenticating}
          >
            Setup connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailForwardingDialog;
