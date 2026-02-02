'use client';

import { Button, DrilldownMenu, Skeleton } from '@zamp-platform/ui';
import { CirclePlus } from 'lucide-react';
import ConnectionList from 'modules/process/knowledge-base-creation/components/ConnectionList';
import { TriggerItem } from 'modules/process/knowledge-base-creation/components/TriggerItem';
import { useTriggerSelectorLogic } from 'modules/process/knowledge-base-creation/hooks/useTriggerSelectorLogic';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ConnectionModal from '@/modules/integrations/components/ConnectionModal';
import { IntegrationType } from '@/modules/integrations/types/integrations.types';

const TriggerSelector = ({ integrations }: { integrations: IntegrationType[] }) => {
  const {
    isFetchingTriggerSubscriptions,
    isFetchingProcessConnectionMappings,
    hasTriggers,
    combinedTriggers,
    menuNode,
    selectedIntegration,
    dialogIntent,
    availableConnections,
    isCreatingTriggerSubscription,
    handlePointerEnter,
    handleClick,
    handleConnect,
    handleAddAnother,
    handleClose,
    handleDialogOpenChange,
    handleCreateTrigger,
  } = useTriggerSelectorLogic({ integrations });

  return (
    <>
      <CommonWrapper
        isLoading={(isFetchingTriggerSubscriptions || isFetchingProcessConnectionMappings) && !hasTriggers}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<Skeleton className='h-6 w-72 rounded' />}
      >
        <div className='flex flex-wrap items-center gap-2'>
          {combinedTriggers.map((trigger) => (
            <TriggerItem key={trigger.id} trigger={trigger} />
          ))}
          <DrilldownMenu
            menuNode={menuNode}
            asChildTrigger
            handleClick={handleClick}
            onPointerEnter={handlePointerEnter}
          >
            <Button
              leadingIcon={<CirclePlus size={12} />}
              size='xsmall'
              variant={hasTriggers ? 'ghost' : 'outline'}
              className='w-fit select-none'
            >
              {hasTriggers ? '' : 'Add'}
            </Button>
          </DrilldownMenu>
        </div>
      </CommonWrapper>
      <ConnectionList
        isOpen={dialogIntent?.type === 'connections'}
        onOpenChange={handleDialogOpenChange}
        onConnect={handleConnect}
        onAddAnother={handleAddAnother}
        connections={availableConnections}
        integrationName={selectedIntegration?.display_name || ''}
        isLoading={isCreatingTriggerSubscription}
        isTriggerSelector
      />
      {selectedIntegration && (
        <ConnectionModal
          integration={selectedIntegration}
          isOpen={dialogIntent?.type === 'create'}
          onClose={handleClose}
          onSubmit={handleCreateTrigger}
          isCreatingTrigger={isCreatingTriggerSubscription}
        />
      )}
    </>
  );
};

export default TriggerSelector;
