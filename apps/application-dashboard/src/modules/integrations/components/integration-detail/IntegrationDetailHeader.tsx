import { type FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import { IMAGE_PREFIX } from '@/constants/icons';

interface IntegrationDetailHeaderProps {
  displayName: string;
  logo: string;
  showGuide: boolean;
  onGuideClick: () => void;
  onConnectClick: () => void;
}

const IntegrationDetailHeader: FC<IntegrationDetailHeaderProps> = ({
  displayName,
  logo,
  showGuide,
  onGuideClick,
  onConnectClick,
}) => {
  return (
    <div className='mt-18 flex items-center justify-between'>
      <div className='flex items-center gap-x-2'>
        <div className='relative h-7 w-7 flex-shrink-0'>
          <Image
            src={`${IMAGE_PREFIX}${logo}`}
            alt={displayName}
            priority
            fill
            sizes='28px'
            className='object-contain'
          />
        </div>
        <span className='f-20-600 text-GRAY_1000'>{displayName}</span>
      </div>

      <div className='flex items-center gap-x-1.5'>
        <Button
          variant='ghost'
          size='small'
          onClick={onGuideClick}
          className={cn(
            'f-12-500 text-GRAY_1000 flex items-center gap-x-1 px-3 py-1.5',
            showGuide ? 'bg-GRAY_100' : 'bg-transparent',
          )}
        >
          <BookOpen width={14} height={14} />
          Guide
        </Button>
        <Button variant='default' size='small' onClick={onConnectClick} className='f-12-500 px-3 py-1.5'>
          Connect
        </Button>
      </div>
    </div>
  );
};

export default IntegrationDetailHeader;
