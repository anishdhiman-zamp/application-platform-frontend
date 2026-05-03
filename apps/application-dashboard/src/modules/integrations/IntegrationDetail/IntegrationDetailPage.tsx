'use client';

import { type FC, useRef, useState } from 'react';
import { ScrollContainer } from '@zamp-platform/ui';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ImageKitImage from '@/components/ImageKitImage';
import { NEEDS_ATTENTION_EMPTY_STATE } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import ConnectionModal from '@/modules/integrations/components/ConnectionModal';
import ConnectionPeopleTab from '@/modules/integrations/IntegrationDetail/ConnectionPeopleTab';
import IntegrationDetailHeader from '@/modules/integrations/IntegrationDetail/IntegrationDetailHeader';
import IntegrationGuidePanel from '@/modules/integrations/IntegrationDetail/IntegrationGuidePanel';
import type {
  ConnectionEntryType,
  IntegrationDetailPagePropsType,
} from '@/modules/integrations/types/integrations.types';
import type { IntegrationItem } from '@/types/api/integrations';

const IntegrationDetailPage: FC<IntegrationDetailPagePropsType> = ({ integration }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { guide, display_name, logo, what_possible, connectionMetadata } = integration;
  const searchParams = useSearchParams();
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState<boolean>(false);

  const handleGuideClick = () => {
    setShowGuide(!showGuide);
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
        className='flex h-full shrink-0 flex-col overflow-hidden'
      >
        <div className='flex w-full justify-center'>
          <div className='flex w-full max-w-200 shrink-0 flex-col'>
            <div className='flex w-full shrink-0 items-center justify-start py-2'>
              <Link
                href={`${ROUTES_PATH.CHAT_SETTINGS_INTEGRATIONS}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`}
                className='text-GRAY_700 hover:text-GRAY_1000 flex items-center justify-center rounded-md py-1 transition-colors'
                aria-label='Go back'
              >
                <ArrowLeft size={16} />
              </Link>
            </div>
            <div className='flex w-full shrink-0 flex-col gap-y-5 pt-5.5'>
              <IntegrationDetailHeader
                displayName={display_name}
                logo={logo}
                guide={guide}
                showGuide={showGuide}
                onGuideClick={handleGuideClick}
                integrationItem={connectionMetadata as unknown as IntegrationItem | undefined}
              />
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
            </div>
          </div>
        </div>

        <ScrollContainer className='mt-4 flex-1' scrollClassName='pb-6' scrollbarStyle='none'>
          <div className='flex w-full justify-center'>
            <div className='flex w-full max-w-200 flex-col'>
              {connectionMetadata?.connections?.length ? (
                <ConnectionPeopleTab
                  connections={connectionMetadata.connections as ConnectionEntryType[]}
                  integrationName={integration.id}
                  integrationLogo={logo || undefined}
                />
              ) : (
                <div className='flex w-full flex-col items-center justify-center gap-y-2 py-16'>
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
        </ScrollContainer>
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
