'use client';

import { type FC, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import LeftArrow from '@/assets/Icons/LeftArrow';
import { COLORS } from '@/constants/colors';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import ConnectionModal from '@/modules/integrations/components/ConnectionModal';
import IntegrationDetailHeader from '@/modules/integrations/IntegrationDetail/IntegrationDetailHeader';
import IntegrationGuidePanel from '@/modules/integrations/IntegrationDetail/IntegrationGuidePanel';
import IntegrationMainContent from '@/modules/integrations/IntegrationDetail/IntegrationMainContent';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { cn } from '@/utils/common';

interface IntegrationDetailPageProps {
  integration: IntegrationType;
}

const IntegrationDetailPage: FC<IntegrationDetailPageProps> = ({ integration }) => {
  const { guide, display_name, logo, what_possible } = integration;

  const contentRef = useRef<HTMLDivElement>(null);
  const { ref: scrollContainerRef, isScrolled } = useScrollDetection();

  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState<boolean>(false);

  const handleGuideClick = () => {
    setShowGuide(!showGuide);
  };

  const handleConnectClick = () => {
    setIsConnectionModalOpen(true);
  };

  return (
    <div className='flex h-full w-full'>
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
            href={ROUTES_PATH.INTEGRATIONS}
            className={cn('flex w-full items-center justify-start py-5', isScrolled && 'border-GRAY_400 border-b')}
            aria-label='Go back'
          >
            <LeftArrow width={14} height={14} color={COLORS.GRAY_900} />
          </Link>
          <div
            ref={scrollContainerRef}
            className='flex h-full w-full flex-col gap-y-8 overflow-y-auto pt-16 pb-6 [scrollbar-width:none]'
          >
            <div className='flex flex-col gap-y-5'>
              <IntegrationDetailHeader
                displayName={display_name}
                logo={logo}
                showGuide={showGuide}
                onGuideClick={handleGuideClick}
                onConnectClick={handleConnectClick}
              />
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
            </div>
            <IntegrationMainContent />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGuide && <IntegrationGuidePanel guide={guide} onClose={handleGuideClick} />}
      </AnimatePresence>

      <ConnectionModal
        integration={integration}
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
      />
    </div>
  );
};

export default IntegrationDetailPage;
