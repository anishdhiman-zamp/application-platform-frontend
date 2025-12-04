import { type FC, useMemo } from 'react';
import { Button } from '@zamp-platform/ui';
import ConnectionPills from 'modules/integrations/components/pills/ConnectionPills';
import ProcessPill from 'modules/integrations/components/pills/ProcessPill';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RightArrow from '@/assets/Icons/RightArrow';
import { IMAGE_PREFIX } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import type { IntegrationType } from '@/modules/integrations/integrations.types';

interface IntegrationCardProps {
  integration: IntegrationType;
  isEnabled?: boolean;
}

const IntegrationCard: FC<IntegrationCardProps> = ({ integration, isEnabled = false }) => {
  const router = useRouter();
  const { id, display_name, logo, what_possible } = integration;

  const description = useMemo(() => {
    const items = what_possible.slice(0, 4);
    const text = items.join(', ');

    return what_possible.length > 4 ? `${text}, & more` : text;
  }, [what_possible]);

  return (
    <div
      onClick={() => router.push(`${ROUTES_PATH.INTEGRATIONS}/${id}`)}
      className='border-GRAY_400 hover:border-GRAY_300 hover:bg-BG_GRAY_2 active:border-GRAY_300 active:bg-GRAY_100 group flex h-[170px] cursor-pointer flex-col justify-between rounded-md border bg-white p-3.5 transition-colors select-none'
    >
      <div className='flex flex-col gap-y-2'>
        {/* Logo and Name */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-x-2'>
            <div className='relative h-6 w-6 flex-shrink-0'>
              <Image
                src={`${IMAGE_PREFIX}${logo}`}
                alt={display_name}
                priority
                fill
                sizes='24px'
                className='object-contain'
              />
            </div>
            <span className='f-14-550 text-GRAY_1000'>{display_name}</span>
          </div>

          <RightArrow width={14} height={14} className='text-GRAY_700 hidden group-hover:block' />
        </div>

        {/* Description */}
        <p className='f-12-450 text-GRAY_700 line-clamp-2'>{description}</p>
      </div>

      {/* Connect Button or Stats */}
      <div className='mt-4 flex justify-end'>
        {isEnabled ? (
          <div className='flex w-full items-center justify-between'>
            <ConnectionPills />
            <ProcessPill />
          </div>
        ) : (
          <Button
            variant='ghost'
            size='small'
            className='text-GRAY_700 f-11-500 hover:bg-GRAY_100 group-hover:text-GRAY_1000 group-active:text-GRAY_1000'
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
