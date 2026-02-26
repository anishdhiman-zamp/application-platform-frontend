'use client';

import { type FC, useMemo, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import IntegrationCardContent from 'modules/integrations/AllIntegrations/IntegrationCardContent';
import ConnectionModal from 'modules/integrations/components/ConnectionModal';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import ConnectionPills from '@/modules/integrations/Pills/ConnectionPills';
import ProcessPill from '@/modules/integrations/Pills/ProcessPill';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { cn } from '@/utils/common';

interface IntegrationCardProps {
  integration: IntegrationType;
  isEnabled?: boolean;
}

const IntegrationCard: FC<IntegrationCardProps> = ({ integration, isEnabled = false }) => {
  const router = useRouter();
  const { id, display_name, logo, what_possible } = integration;
  const [isHoveringPills, setIsHoveringPills] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  const description = useMemo(() => {
    const items = what_possible.slice(0, 4);
    const text = items.join(', ');

    return what_possible.length > 4 ? `${text}, & more` : text;
  }, [what_possible]);

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnectionModalOpen(true);
  };

  const handleCardClick = () => {
    router.push(`${ROUTES_PATH.INTEGRATIONS}/${id}`);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          'border-GRAY_400 group flex h-[170px] cursor-pointer flex-col justify-between rounded-md border bg-white p-3.5 transition-colors select-none',
          !isHoveringPills && 'hover:border-GRAY_300 hover:bg-BG_GRAY_2 active:border-GRAY_300 active:bg-GRAY_100',
        )}
      >
        <IntegrationCardContent logo={logo} displayName={display_name} description={description} />

        {isEnabled ? (
          <div className='flex w-full items-center justify-between'>
            <ConnectionPills
              onMouseEnter={() => setIsHoveringPills(true)}
              onMouseLeave={() => setIsHoveringPills(false)}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
            <ProcessPill
              onMouseEnter={() => setIsHoveringPills(true)}
              onMouseLeave={() => setIsHoveringPills(false)}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </div>
        ) : (
          <Button
            variant='ghost'
            size='small'
            onClick={handleConnectClick}
            className='text-GRAY_700 f-11-500 hover:bg-GRAY_100 group-hover:text-GRAY_1000 group-active:text-GRAY_1000 ml-auto'
          >
            Connect
          </Button>
        )}
      </div>

      {integration && Object.keys(integration).length > 0 && (
        <ConnectionModal
          integration={integration}
          isOpen={isConnectionModalOpen}
          onClose={() => setIsConnectionModalOpen(false)}
        />
      )}
    </>
  );
};

export default IntegrationCard;
