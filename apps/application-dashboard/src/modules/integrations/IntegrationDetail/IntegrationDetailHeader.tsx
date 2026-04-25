import { type FC, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { BookOpen, Info, Plus } from 'lucide-react';
import { handleActivationKeyDown } from '@/constants/shortcuts';
import ConnectIntegrationAction from '@/modules/integrations/AllIntegrations/ConnectIntegrationAction';
import IntegrationInfoDialog from '@/modules/integrations/AllIntegrations/IntegrationInfoDialog';
import type { IntegrationDetailHeaderPropsType } from '@/modules/integrations/types/integrations.types';
import type { IntegrationItem } from '@/types/api/integrations';
import { getNameInitial } from '@/utils/common';

const IntegrationDetailHeader: FC<IntegrationDetailHeaderPropsType> = ({
  displayName,
  logo,
  guide,
  showGuide,
  onGuideClick,
  integrationItem,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const hasConnections = !!integrationItem?.connections?.length;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-x-2'>
        <div className='relative flex h-7 w-7 shrink-0 items-center justify-center'>
          {imgError || !logo ? (
            <div className='bg-GRAY_200 text-GRAY_700 f-12-550 flex h-full w-full items-center justify-center rounded'>
              {getNameInitial(displayName)}
            </div>
          ) : (
            <img src={logo} alt={displayName} className='object-contain' onError={() => setImgError(true)} />
          )}
        </div>
        <span className='f-20-600 text-GRAY_1000'>{displayName}</span>
      </div>

      <div className='flex items-center gap-x-2'>
        {integrationItem && (
          <div
            role='button'
            tabIndex={0}
            onClick={() => setIsInfoDialogOpen(true)}
            onKeyDown={(e) => handleActivationKeyDown(e, () => setIsInfoDialogOpen(true))}
            className='text-GRAY_700 hover:text-GRAY_1000 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors'
            aria-label='Integration info'
          >
            <Info width={16} height={16} />
          </div>
        )}

        <ConnectIntegrationAction
          integrationItem={integrationItem || ({} as IntegrationItem)}
          copy={hasConnections ? 'Add Connection' : 'Connect'}
          buttonVariant='default'
          icon={hasConnections ? <Plus className='h-3.5 w-3.5' /> : undefined}
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

      {integrationItem && (
        <IntegrationInfoDialog
          integrationItem={integrationItem}
          isOpen={isInfoDialogOpen}
          onOpenChange={setIsInfoDialogOpen}
        />
      )}
    </div>
  );
};

export default IntegrationDetailHeader;
