'use client';

import { type FC, useRef } from 'react';
import { FormBuilder, type FormBuilderRef } from '@zamp-platform/form-builder';
import { Button, Dialog, DialogBody, DialogContent, DialogFooter } from '@zamp-platform/ui';
import { ArrowRight } from 'lucide-react';
import ConnectionGuidePanel from 'modules/integrations/components/ConnectionGuidePanel';
import { connectionSchema } from 'modules/integrations/components/connectionSchema';
import Image from 'next/image';
import { IMAGE_PREFIX } from '@/constants/icons';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { cn } from '@/utils/common';

interface ConnectionModalProps {
  integration: IntegrationType;
  isOpen: boolean;
  onClose: () => void;
}

const ConnectionModal: FC<ConnectionModalProps> = ({ integration, isOpen, onClose }) => {
  const formRef = useRef<FormBuilderRef>(null);
  const { ref: scrollContainerRef, isScrolled } = useScrollDetection();

  const { display_name, logo, guide } = integration;

  const handleTest = () => {
    // TODO: Implement test connection logic
    console.log('Testing connection...');
  };

  const handleSetupConnection = () => {
    formRef.current?.submit();
  };

  const handleFormSubmit = (data: Record<string, string>) => {
    // TODO: Implement connection setup logic
    console.log('Form submitted:', data);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='border-GRAY_300 h-[600px] max-h-[600px] w-[1000px] max-w-[1000px] rounded-xl border'>
        <DialogBody className='flex flex-1 overflow-hidden rounded-xl'>
          {/* Left Side - Form */}
          <div className='bg-BG_GRAY_2 flex w-[40%] flex-shrink-0 flex-col overflow-hidden'>
            {/* Integration name - Fixed header */}
            <div
              className={cn('flex shrink-0 items-center gap-x-1 px-6 py-6', isScrolled && 'border-GRAY_500 border-b')}
            >
              <div className='relative h-5 w-5 flex-shrink-0 p-[2px]'>
                <Image
                  src={`${IMAGE_PREFIX}${logo}`}
                  alt={display_name}
                  priority
                  fill
                  sizes='20px'
                  className='object-contain'
                />
              </div>
              <span className='f-14-550 text-GRAY_1000'>{display_name}</span>
            </div>

            {/* Form - Scrollable content */}
            <div ref={scrollContainerRef} className='flex-1 overflow-y-auto px-6 pb-6 [scrollbar-width:none]'>
              <FormBuilder ref={formRef} schema={connectionSchema} onSubmit={handleFormSubmit} />
            </div>
          </div>

          {/* Right Side - Guide */}
          <ConnectionGuidePanel guide={guide} onClose={onClose} />
        </DialogBody>

        {/* Footer */}
        <DialogFooter className='flex items-center justify-between border-t px-6 py-4'>
          <Button variant='outline' size='small' onClick={handleTest} className='f-12-500 rounded-md px-3 py-1.5'>
            Test
          </Button>

          <Button
            variant='default'
            size='small'
            onClick={handleSetupConnection}
            className='f-12-500 gap-x-1 rounded-md px-3 py-1.5'
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
