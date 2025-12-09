import type { FC } from 'react';
import Image from 'next/image';
import RightArrow from '@/assets/Icons/RightArrow';
import { IMAGE_PREFIX } from '@/constants/icons';

interface IntegrationCardContentProps {
  logo: string;
  displayName: string;
  description: string;
}

const IntegrationCardContent: FC<IntegrationCardContentProps> = ({ logo, displayName, description }) => {
  return (
    <div className='flex flex-col gap-y-2'>
      {/* Logo and Name */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-x-2'>
          <div className='relative h-6 w-6 flex-shrink-0'>
            <Image
              src={`${IMAGE_PREFIX}${logo}`}
              alt={displayName}
              priority
              fill
              sizes='24px'
              className='object-contain'
            />
          </div>
          <span className='f-14-550 text-GRAY_1000'>{displayName}</span>
        </div>

        <RightArrow width={14} height={14} className='text-GRAY_700 hidden group-hover:block' />
      </div>

      {/* Description */}
      <p className='f-12-450 text-GRAY_700 line-clamp-2'>{description}</p>
    </div>
  );
};

export default IntegrationCardContent;
