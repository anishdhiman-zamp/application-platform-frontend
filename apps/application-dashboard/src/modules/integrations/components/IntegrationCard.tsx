import { type FC, useMemo } from 'react';
import { Button } from '@zamp-platform/ui';
import type { IntegrationType } from 'modules/integrations/integration.types';
import Image from 'next/image';
import { IMAGE_PREFIX } from '@/constants/icons';

interface IntegrationCardProps {
  integration: IntegrationType;
}

const IntegrationCard: FC<IntegrationCardProps> = ({ integration }) => {
  const { display_name, logo, what_possible } = integration;

  const description = useMemo(() => {
    const items = what_possible.slice(0, 4);
    const text = items.join(', ');

    return what_possible.length > 4 ? `${text}, & more` : text;
  }, [what_possible]);

  return (
    <div className='border-GRAY_400 hover:border-GRAY_300 hover:bg-BG_GRAY_2 active:border-GRAY_300 active:bg-GRAY_100 group flex h-[170px] flex-col justify-between rounded-md border bg-white p-3.5 transition-colors'>
      <div className='flex flex-col gap-y-2'>
        {/* Logo and Name */}
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
          <span className='f-14-550 text-GRAY_1000 line-clamp-2'>{display_name}</span>
        </div>

        {/* Description */}
        <p className='f-12-450 text-GRAY_700 text-select-none'>{description}</p>
      </div>

      {/* Connect Button */}
      <div className='mt-4 flex justify-end'>
        <Button
          variant='ghost'
          size='small'
          className='text-GRAY_700 f-11-500 group-hover:text-GRAY_1000 group-active:text-GRAY_1000'
        >
          Connect
        </Button>
      </div>
    </div>
  );
};

export default IntegrationCard;
