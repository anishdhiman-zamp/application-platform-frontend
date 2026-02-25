'use client';

import { type FC, useMemo, useRef, useState } from 'react';
import { FormBuilder, type FormBuilderRef } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, toast } from '@zamp-platform/ui';
import { ArrowRight } from 'lucide-react';
import { generateFormSections } from 'modules/integrations/components/utils';
import { useParams } from 'next/navigation';
import { useAuthenticateIntegrationMutation } from '@/apis/integrations';
import { useProcesses } from '@/contexts/ProcessesContext';
import { useAppSelector } from '@/hooks/toolkit';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import { AUTH_TYPE } from '@/modules/integrations/types/integrations.types';
import type { RootState } from '@/store';
import { IntegrationItem } from '@/types/api/integrations';
import { cn } from '@/utils/common';

interface EmailForwardingDialogProps {
  integration: IntegrationItem;
  isOpen: boolean;
  onClose: () => void;
  isCreatingTrigger?: boolean;
  onSubmit?: (connectionId: string) => void;
  animated?: boolean;
}

const EmailForwardingDialog: FC<EmailForwardingDialogProps> = ({
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
  const { ref: scrollContainerRef, isScrolled } = useScrollDetection();
  const [authenticateIntegration, { isLoading: isAuthenticating }] = useAuthenticateIntegrationMutation();
  const { processes } = useProcesses();

  const { title, icon, name, auth } = integration;
  const [error, setError] = useState<string>('');

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
      <DialogContent className='border-GRAY_300 h-auto max-h-[600px] max-w-[1000px] rounded-xl border'>
        <DialogBody className='flex flex-1 overflow-hidden rounded-xl'>
          <div className='bg-BG_GRAY_2 w-full flex-shrink-0 flex-col overflow-hidden'>
            <div
              className={cn('flex shrink-0 items-center gap-x-1.5 px-6 py-6', isScrolled && 'border-GRAY_500 border-b')}
            >
              <div className='relative h-5 w-5 flex-shrink-0 p-[2px]'>
                <img src={icon} alt={title} className='h-5 w-5 object-contain' />
              </div>
              <span className='f-14-550 text-GRAY_1000'>{title}</span>
            </div>

            <div ref={scrollContainerRef} className='flex-1 overflow-y-auto px-6 pb-6 [scrollbar-width:none]'>
              {auth.length > 0 && (
                <FormBuilder
                  ref={formRef}
                  schema={generateFormSections(name, auth[0], orgName, currentProcess?.display_name)}
                  onSubmit={handleFormSubmit}
                  animated={animated}
                />
              )}
              <div className='f-13-450 text-red-900'>{error}</div>
            </div>
          </div>
        </DialogBody>

        {/* Footer */}
        <DialogFooter className='flex items-center justify-between border-t px-6 py-4'>
          <Button
            variant='default'
            size='small'
            onClick={handleSetupConnection}
            className='f-12-500 ml-auto gap-x-1 rounded-md px-3 py-1.5'
            isLoading={isCreatingTrigger || isAuthenticating}
          >
            <ArrowRight width={16} height={16} />
            Setup connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailForwardingDialog;
