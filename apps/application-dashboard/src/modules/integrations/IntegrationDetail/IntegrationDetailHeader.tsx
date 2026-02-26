import { type FC, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { BookOpen } from 'lucide-react';
import ConnectIntegrationAction from '@/modules/integrations/AllIntegrations/ConnectIntegrationAction';
import type { IntegrationItem } from '@/types/api/integrations';
import type { defaultFnType } from '@/types/commonTypes';

interface IntegrationDetailHeaderProps {
  displayName: string;
  logo: string;
  guide: string;
  showGuide: boolean;
  onGuideClick: defaultFnType;
  integrationItem?: IntegrationItem;
}

const IntegrationDetailHeader: FC<IntegrationDetailHeaderProps> = ({
  displayName,
  logo,
  guide,
  showGuide,
  onGuideClick,
  integrationItem,
}) => {
  const [imgError, setImgError] = useState(false);
  const hasConnections = !!integrationItem?.connections?.length;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-x-2'>
        <div className='relative flex h-7 w-7 flex-shrink-0 items-center justify-center'>
          {imgError || !logo ? (
            <div className='bg-GRAY_200 text-GRAY_700 f-12-550 flex h-full w-full items-center justify-center rounded'>
              {displayName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <img src={logo} alt={displayName} className='object-contain' onError={() => setImgError(true)} />
          )}
        </div>
        <span className='f-20-600 text-GRAY_1000'>{displayName}</span>
      </div>

      <div className='flex items-center gap-x-2'>
        <ConnectIntegrationAction
          integrationItem={integrationItem || ({} as IntegrationItem)}
          copy={hasConnections ? 'Add Connections' : 'Connect'}
          buttonVariant='default'
        />

        {guide && (
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
        )}
      </div>
    </div>
  );
};

export default IntegrationDetailHeader;
