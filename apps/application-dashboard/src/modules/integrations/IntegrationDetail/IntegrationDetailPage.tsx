'use client';

import { type FC, useRef, useState } from 'react';
import { Button, toast } from '@zamp-platform/ui';
import { ArrowLeft } from 'lucide-react';
import ShareConnectionPopup from 'modules/integrations/IntegrationDetail/ShareConnectionPopup';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useDeleteIntegrationConnectionMutation } from '@/apis/integrations';
import ImageKitImage from '@/components/ImageKitImage';
import { COLORS } from '@/constants/colors';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import ConnectionModal from '@/modules/integrations/components/ConnectionModal';
import IntegrationDetailHeader from '@/modules/integrations/IntegrationDetail/IntegrationDetailHeader';
import IntegrationGuidePanel from '@/modules/integrations/IntegrationDetail/IntegrationGuidePanel';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import type { IntegrationItem } from '@/types/api/integrations';
import { cn } from '@/utils/common';

interface IntegrationDetailPageProps {
  integration: IntegrationType;
}

const IntegrationDetailPage: FC<IntegrationDetailPageProps> = ({ integration }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { guide, display_name, logo, description, what_possible, connectionMetadata } = integration;
  const { ref: scrollContainerRef, isScrolled } = useScrollDetection();
  const [deleteIntegrationConnection] = useDeleteIntegrationConnectionMutation();
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState<boolean>(false);
  const [deletingConnectionId, setDeletingConnectionId] = useState<string | null>(null);

  const handleGuideClick = () => {
    setShowGuide(!showGuide);
  };

  const handleRemoveConnection = async (id: string) => {
    setDeletingConnectionId(id);
    try {
      await deleteIntegrationConnection({ connectionId: id }).unwrap();
      toast.success('Connection removed successfully');
    } catch {
      toast.error('Failed to remove connection');
    } finally {
      setDeletingConnectionId(null);
    }
  };

  return (
    <div className='bg-BG_WHITE flex h-full w-full'>
      <motion.div
        initial={false}
        animate={{
          width: showGuide ? '70%' : '100%',
        }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut',
        }}
        className='flex flex-shrink-0 items-center justify-center overflow-hidden'
      >
        <div className='flex h-full w-[700px] flex-col'>
          <Link
            href={ROUTES_PATH.CHAT_SETTINGS_INTEGRATIONS}
            className={cn('flex w-full items-center justify-start py-5', isScrolled && 'border-GRAY_400 border-b')}
            aria-label='Go back'
          >
            <ArrowLeft size={14} color={COLORS.GRAY_900} />
          </Link>
          <div
            ref={scrollContainerRef}
            className='flex h-full w-full flex-col gap-y-8 overflow-y-auto pt-16 pb-6 [scrollbar-width:none]'
          >
            <div className='flex flex-1 flex-col gap-y-5'>
              <IntegrationDetailHeader
                displayName={display_name}
                logo={logo}
                guide={guide}
                showGuide={showGuide}
                onGuideClick={handleGuideClick}
                integrationItem={connectionMetadata as unknown as IntegrationItem | undefined}
              />
              {description && <span className='f-14-500 text-GRAY_900'>{description}</span>}
              {!!what_possible?.length && (
                <div className='flex flex-col gap-y-1.5'>
                  <span className='f-12-450 text-GRAY_700'>What&apos;s possible</span>
                  <div className='relative'>
                    <div
                      ref={contentRef}
                      className='flex flex-wrap gap-1.5 overflow-hidden transition-[max-height] duration-300 ease-in-out'
                      style={{
                        maxHeight: contentRef.current?.scrollHeight,
                      }}
                    >
                      {what_possible?.map((action, index) => (
                        <span
                          key={index}
                          className='bg-BG_GRAY_2 text-GRAY_950 border-GRAY_400 f-13-500 rounded-full border px-2.5 py-1'
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className='mt-4 flex flex-1 flex-col'>
                {connectionMetadata?.connections?.length ? (
                  <div className='flex w-full flex-col gap-y-8'>
                    {connectionMetadata?.connections?.map((account: { id: string; name: string }) => (
                      <div key={account.id} className='flex w-full items-center justify-between'>
                        <span className='f-12-450 text-GRAY_700'>{account.name}</span>

                        <div className='flex items-center gap-x-2'>
                          <Button
                            size='xsmall'
                            className='f-11-500'
                            onClick={() => handleRemoveConnection(account?.id || '')}
                            isLoading={deletingConnectionId === account?.id}
                          >
                            Remove
                          </Button>
                          <ShareConnectionPopup connectionId={account?.id || ''} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex w-full flex-1 flex-col items-center justify-center gap-y-2'>
                    <ImageKitImage
                      src={NEEDS_ATTENTION_EMPTY_STATE}
                      alt='No connections'
                      width={200}
                      height={150}
                      className='object-contain'
                    />
                    <span className='f-13-450 text-GRAY_700'>No connections found for this integration</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGuide && <IntegrationGuidePanel guide={guide} onClose={handleGuideClick} />}
      </AnimatePresence>

      {integration && Object.keys(integration).length > 0 && (
        <ConnectionModal
          integration={integration}
          isOpen={isConnectionModalOpen}
          onClose={() => setIsConnectionModalOpen(false)}
        />
      )}
    </div>
  );
};

export default IntegrationDetailPage;
