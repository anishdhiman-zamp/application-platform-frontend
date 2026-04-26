'use client';

import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { FormBuilder, type FormBuilderRef } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, toast } from '@zamp-platform/ui';
import { ArrowRight } from 'lucide-react';
import ConnectionGuidePanel from 'modules/integrations/components/ConnectionGuidePanel';
import { generateFormSections } from 'modules/integrations/components/utils';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAuthenticateIntegrationMutation } from '@/apis/integrations';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { getAssetUrl, ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useProcesses } from '@/contexts/ProcessesContext';
import { useAppSelector } from '@/hooks/toolkit';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import type { ConnectionModalPropsType, IntegrationAuth } from '@/modules/integrations/types/integrations.types';
import type { RootState } from '@/store';
import { cn } from '@/utils/common';

const ConnectionModal: FC<ConnectionModalPropsType> = ({
  integration,
  isOpen,
  onClose,
  isCreatingTrigger = false,
  onSubmit,
  animated = false,
}) => {
  // Refs
  const formRef = useRef<FormBuilderRef>(null);

  // Hooks
  const params = useParams();
  const { processes } = useProcesses();
  const { ref: scrollContainerRef, isScrolled } = useScrollDetection();
  const [authenticateIntegration, { isLoading: isAuthenticating }] = useAuthenticateIntegrationMutation();
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name);

  // States
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authContent, setAuthContent] = useState<IntegrationAuth[]>([]);

  // Constants
  const { display_name, logo, guide, auth, id } = integration;
  const noGuide = !guide;

  // Memos
  const currentProcess = useMemo(
    () => processes?.find((process) => process.process_id === params?.processId),
    [processes, params?.processId],
  );

  const handleTest = () => {
    // TODO: Implement test connection logic
    console.log('Testing connection...');
  };

  const handleSetupConnection = () => {
    formRef.current?.submit();
  };

  const handleFormSubmit = (data: Record<string, string>) => {
    setError('');
    authenticateIntegration({
      integration_name: integration.id,
      auth_type: 'custom',
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

  const getAuthContent = useCallback(() => {
    if (!auth) {
      setIsLoading(false);

      return;
    }

    setIsLoading(true);
    const authUrl = getAssetUrl(auth);

    fetch(authUrl)
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(new Error('Failed to fetch auth'));
        }

        return response.json() as Promise<IntegrationAuth[]>;
      })
      .then((content) => {
        setAuthContent(content);
      })
      .catch((error) => {
        setAuthContent([]);
        captureException(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [auth]);

  useEffect(() => {
    getAuthContent();
  }, [auth, getAuthContent]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn('border-GRAY_300 bg-BG_WHITE h-150 max-h-150 w-115 max-w-115 rounded-xl border', {
          'h-auto': noGuide,
        })}
        showCloseButton={noGuide}
      >
        <DialogBody className='flex flex-1 overflow-hidden rounded-xl'>
          {/* Left Side - Form */}
          <div className={cn('bg-BG_GRAY_2 flex w-[40%] shrink-0 flex-col overflow-hidden', { 'w-full': noGuide })}>
            {/* Integration name - Fixed header */}
            <div
              className={cn('flex shrink-0 items-center gap-x-1.5 px-6 py-6', isScrolled && 'border-GRAY_500 border-b')}
            >
              <div className='relative h-5 w-5 shrink-0 p-[2px]'>
                <Image src={logo} alt={display_name} priority fill sizes='20px' className='object-contain' />
              </div>
              <span className='f-14-550 text-GRAY_1000'>{display_name}</span>
            </div>

            {/* Form - Scrollable content */}
            <CommonWrapper
              className='h-full'
              loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={100} height={100} />}
              skeletonType={SkeletonTypes.CUSTOM}
              isLoading={isLoading}
            >
              <div ref={scrollContainerRef} className='flex-1 overflow-y-auto px-6 pb-6 [scrollbar-width:none]'>
                {authContent.length > 0 && (
                  <FormBuilder
                    ref={formRef}
                    schema={generateFormSections(id, authContent[0], orgName, currentProcess?.display_name)}
                    onSubmit={handleFormSubmit}
                    animated={animated}
                  />
                )}
                <div className='f-13-450 text-red-900'>{error}</div>
              </div>
            </CommonWrapper>
          </div>

          {!noGuide && <ConnectionGuidePanel guide={guide} onClose={onClose} />}
        </DialogBody>

        {/* Footer */}
        <DialogFooter className='flex items-center justify-between border-t px-6 py-4'>
          {!noGuide && (
            <Button variant='outline' size='small' onClick={handleTest} className='f-12-500 rounded-md px-3 py-1.5'>
              Test
            </Button>
          )}

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

export default ConnectionModal;
