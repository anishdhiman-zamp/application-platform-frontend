'use client';

import { type FC, useEffect, useRef, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import IntegrationDetailHeader from 'modules/integrations/components/integration-detail/IntegrationDetailHeader';
import IntegrationGuidePanel from 'modules/integrations/components/integration-detail/IntegrationGuidePanel';
import IntegrationMainContent from 'modules/integrations/components/integration-detail/IntegrationMainContent';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import LeftArrow from '@/assets/Icons/LeftArrow';
import { COLORS } from '@/constants/colors';
import { ROUTES_PATH } from '@/constants/routeConfig';
import type { IntegrationType } from '@/modules/integrations/integrations.types';

interface IntegrationDetailPageProps {
  integration: IntegrationType;
}

const COLLAPSED_HEIGHT = 60;

const IntegrationDetailPage: FC<IntegrationDetailPageProps> = ({ integration }) => {
  const { id, guide, display_name, logo, what_possible } = integration;

  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        setHasOverflow(contentRef.current.scrollHeight > COLLAPSED_HEIGHT);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, [what_possible]);

  const handleGuideClick = () => {
    setShowGuide(!showGuide);
  };

  const handleConnectClick = () => {
    // TODO: Implement connect functionality
    console.log('Connect clicked for:', id);
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
            className='mt-5 flex w-fit items-center justify-center'
            aria-label='Go back'
          >
            <LeftArrow width={14} height={14} color={COLORS.GRAY_900} />
          </Link>
          <div className='flex h-full w-full flex-col gap-y-5 overflow-y-auto px-0 pb-6'>
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
                    maxHeight: isExpanded ? contentRef.current?.scrollHeight : COLLAPSED_HEIGHT,
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
                {hasOverflow && !isExpanded && (
                  <div className='absolute right-0 bottom-0 flex items-center'>
                    <Button
                      variant='link'
                      size='xxsmall'
                      onClick={() => setIsExpanded(true)}
                      className='text-GRAY_700 hover:text-GRAY_900 h-auto bg-white p-0 underline'
                    >
                      ...more
                    </Button>
                  </div>
                )}
                {hasOverflow && isExpanded && (
                  <div className='absolute right-0 bottom-0 flex items-center'>
                    <Button
                      variant='link'
                      size='xxsmall'
                      onClick={() => setIsExpanded(false)}
                      className='text-GRAY_700 hover:text-GRAY_900 mt-1 h-auto p-0 underline'
                    >
                      less
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <IntegrationMainContent />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGuide && <IntegrationGuidePanel guide={guide} onClose={handleGuideClick} />}
      </AnimatePresence>
    </div>
  );
};

export default IntegrationDetailPage;
