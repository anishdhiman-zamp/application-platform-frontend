'use client';

import { type FC, useState } from 'react';
import IntegrationDetailHeader from 'modules/integrations/components/integration-detail/IntegrationDetailHeader';
import IntegrationGuidePanel from 'modules/integrations/components/integration-detail/IntegrationGuidePanel';
import IntegrationMainContent from 'modules/integrations/components/integration-detail/IntegrationMainContent';
import { AnimatePresence, motion } from 'motion/react';
import type { IntegrationType } from '@/modules/integrations/integrations.types';

interface IntegrationDetailPageProps {
  integration: IntegrationType;
}

const IntegrationDetailPage: FC<IntegrationDetailPageProps> = ({ integration }) => {
  const { id, guide, display_name, logo, what_possible } = integration;

  const [showGuide, setShowGuide] = useState<boolean>(false);

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
        className='flex-shrink-0 overflow-hidden'
      >
        <div className='flex h-full w-full flex-col gap-y-5 overflow-y-auto px-15 pb-6'>
          <IntegrationDetailHeader
            displayName={display_name}
            logo={logo}
            showGuide={showGuide}
            onGuideClick={handleGuideClick}
            onConnectClick={handleConnectClick}
          />
          <div className='flex flex-col gap-y-1.5'>
            <span className='f-12-450 text-GRAY_700'>What&apos;s possible</span>
            <div className='flex flex-wrap gap-1.5'>
              {what_possible.map((action, index) => (
                <span
                  key={index}
                  className='bg-BG_GRAY_2 text-GRAY_950 border-GRAY_400 f-13-500 rounded-full border px-2.5 py-1'
                >
                  {action}
                </span>
              ))}
            </div>
          </div>
          <IntegrationMainContent />
        </div>
      </motion.div>

      <AnimatePresence>
        {showGuide && <IntegrationGuidePanel guide={guide} onClose={handleGuideClick} />}
      </AnimatePresence>
    </div>
  );
};

export default IntegrationDetailPage;
