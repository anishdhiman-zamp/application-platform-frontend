'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CirclePlus } from 'lucide-react';
import ConnectionList from 'modules/process/knowledge-base-creation/components/ConnectionList';
import IntegrationItem from 'modules/process/knowledge-base-creation/components/IntegrationItem';
import { useIntegrationSelectorLogic } from 'modules/process/knowledge-base-creation/hooks/useIntegrationSelectorLogic';
import Image from 'next/image';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ConnectionModal from '@/modules/integrations/components/ConnectionModal';
import type { IntegrationType } from '@/modules/integrations/types/integrations.types';
import { preventAutoFocus } from '@/utils/common';

const IntegrationSelector = ({ integrations }: { integrations: IntegrationType[] }) => {
  const {
    mappedIntegrations,
    availableIntegrations,
    hasAvailableIntegrations,
    hasMappedIntegrations,
    isFetchingProcessConnectionMappings,
    selectedIntegration,
    dialogIntent,
    handleSelectIntegration,
    handleAddAnother,
    handleClose,
    handleDialogOpenChange,
    getAvailableConnections,
    handleConnectWrapper,
    handleCreateConnectionMapping,
    isCreatingProcessConnectionMapping,
  } = useIntegrationSelectorLogic({ integrations });

  return (
    <>
      <CommonWrapper
        isLoading={isFetchingProcessConnectionMappings && !hasMappedIntegrations}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<Skeleton className='h-6 w-72 rounded' />}
      >
        <div className='flex items-center gap-2'>
          {hasMappedIntegrations &&
            mappedIntegrations.map((integration) => (
              <IntegrationItem key={integration?.integration?.id} mappedIntegration={integration} />
            ))}
          {hasAvailableIntegrations && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  leadingIcon={<CirclePlus size={12} />}
                  size='xsmall'
                  variant={hasMappedIntegrations ? 'ghost' : 'outline'}
                  className='w-fit select-none'
                >
                  {hasMappedIntegrations ? '' : 'Add'}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className='w-64 overflow-hidden' onCloseAutoFocus={preventAutoFocus}>
                {availableIntegrations.map((integration) => {
                  const isDisabled = (integration as IntegrationType & { disabled?: boolean }).disabled === true;
                  const rightText = (integration as IntegrationType & { rightText?: string }).rightText;

                  return (
                    <DropdownMenuItem
                      key={integration.id}
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) {
                          handleSelectIntegration(integration);
                        }
                      }}
                      className={cn(
                        'group flex items-center justify-between gap-2 rounded-md',
                        !isDisabled && 'hover:bg-gray-50',
                        isDisabled && 'cursor-not-allowed',
                      )}
                    >
                      <div className='flex min-w-0 flex-1 items-start gap-2'>
                        <div className={cn('relative h-4 w-4 flex-shrink-0', isDisabled && 'opacity-60')}>
                          <Image
                            src={integration.logo}
                            alt={integration.display_name}
                            fill
                            sizes='16px'
                            className='object-contain'
                          />
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col'>
                          <div className='flex items-center justify-between gap-2'>
                            <span
                              className={cn(
                                'f-13-500',
                                isDisabled ? 'text-gray-700' : 'group-hover:text-gray-1000 text-gray-900',
                              )}
                            >
                              {integration.display_name}
                            </span>
                            {rightText && <span className='f-10-450 whitespace-nowrap text-gray-700'>{rightText}</span>}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CommonWrapper>
      {dialogIntent?.type === 'connections' && (
        <ConnectionList
          isOpen={true}
          onOpenChange={handleDialogOpenChange}
          onConnect={handleConnectWrapper}
          onAddAnother={handleAddAnother}
          connections={getAvailableConnections(dialogIntent?.connections)}
          integrationName={selectedIntegration?.display_name || ''}
          isLoading={isCreatingProcessConnectionMapping}
        />
      )}
      {selectedIntegration && Object.keys(selectedIntegration).length > 0 && (
        <ConnectionModal
          integration={selectedIntegration}
          isOpen={dialogIntent?.type === 'create'}
          onClose={handleClose}
          onSubmit={handleCreateConnectionMapping}
          isCreatingTrigger={isCreatingProcessConnectionMapping}
        />
      )}
    </>
  );
};

export default IntegrationSelector;
