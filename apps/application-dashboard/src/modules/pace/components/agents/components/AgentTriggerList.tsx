'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Skeleton, Switch, toast } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Plus } from 'lucide-react';
import AgentTabEmptyState from 'modules/pace/components/agents/components/AgentTabEmptyState';
import { useGetAgentTriggersQuery, useToggleAgentTriggerMutation } from '@/apis/agents';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { TRANSPARENT_PIXEL } from '@/modules/pace/components/agents/constants/agents.constants';
import type { AgentTriggerType } from '@/modules/pace/components/agents/types/agents.types';

const TriggerSkeleton = () => (
  <div className='border-GRAY_400 flex h-full flex-col rounded-xl border'>
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className={cn('flex items-center justify-between px-3.5 py-3.5', i < 2 && 'border-GRAY_400 border-b')}
      >
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-5 w-9 rounded-full' />
      </div>
    ))}
  </div>
);

interface AgentTriggerListProps {
  agentId: string;
  agentAvatarSrc?: string;
  isActive?: boolean;
  skipFetch?: boolean;
  onTriggerClick?: (trigger: AgentTriggerType) => void;
  onAddTrigger?: () => void;
}

const AgentTriggerList = ({
  agentId,
  agentAvatarSrc,
  isActive = true,
  skipFetch = false,
  onTriggerClick,
  onAddTrigger,
}: AgentTriggerListProps) => {
  const hasBeenActiveRef = useRef(isActive);
  const isFirstVisit = !hasBeenActiveRef.current && isActive;

  if (isActive) hasBeenActiveRef.current = true;

  const shouldSkip = !hasBeenActiveRef.current || skipFetch;

  const [triggers, setTriggers] = useState<AgentTriggerType[]>([]);

  const { data, isLoading, isFetching, isError, refetch } = useGetAgentTriggersQuery({ agentId }, { skip: shouldSkip });

  const [toggleTrigger] = useToggleAgentTriggerMutation();

  const handleToggle = async (triggerId: string) => {
    const trigger = triggers.find((t) => t.id === triggerId);
    const newActive = !trigger?.enabled;

    // Optimistic update
    setTriggers((prev) =>
      prev.map((trigger) => (trigger?.id === triggerId ? { ...trigger, enabled: newActive } : trigger)),
    );

    try {
      await toggleTrigger({ agentId, triggerId, active: newActive }).unwrap();
      toast.success('Trigger toggled successfully');
    } catch {
      // Revert on failure
      setTriggers((prev) => prev.map((t) => (t.id === triggerId ? { ...t, enabled: !newActive } : t)));
      toast.error('Failed to toggle trigger');
    }
  };

  useEffect(() => {
    if (isActive && !isFirstVisit && !skipFetch) refetch();
  }, [isActive, skipFetch]);

  useEffect(() => {
    if (data?.triggers) {
      setTriggers(data.triggers);
    }
  }, [data?.triggers]);

  return (
    <CommonWrapper
      isLoading={shouldSkip || isLoading || (isFetching && triggers?.length === 0)}
      isError={isError}
      refetchFunction={refetch}
      isNoData={!isFetching && triggers?.length === 0 && data?.triggers?.length === 0}
      noDataBanner={
        <AgentTabEmptyState
          agentAvatarSrc={agentAvatarSrc}
          description='Run your agent in the background via triggers'
          actionLabel={!onTriggerClick ? 'Add trigger' : undefined}
          onAction={!onTriggerClick ? onAddTrigger : undefined}
        />
      }
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<TriggerSkeleton />}
      className='flex min-h-0 flex-1 flex-col'
      disableAnimation
    >
      <p className='text-GRAY_700 f-14-450 mb-4 ml-2.5 shrink-0'>What should this agent run?</p>
      <div className='border-GRAY_400 flex flex-col overflow-hidden rounded-xl border'>
        {triggers.map((trigger, index) => {
          const content = (
            <div className='flex items-center gap-3'>
              {trigger.icon && (
                <ImageWithFallback
                  src={trigger.icon}
                  fallback={TRANSPARENT_PIXEL}
                  alt=''
                  width={14}
                  height={14}
                  className='shrink-0 object-contain'
                />
              )}
              <span className='f-14-500 text-GRAY_1000'>{trigger.title}</span>
            </div>
          );

          if (onTriggerClick) {
            return (
              <Button
                key={trigger.id}
                variant='ghost'
                className='hover:bg-GRAY_100 flex h-auto w-full items-center justify-start rounded-md p-2'
                onClick={() => onTriggerClick(trigger)}
              >
                {content}
              </Button>
            );
          }

          return (
            <div
              key={trigger.id}
              className={cn(
                'flex items-center justify-between px-3.5 py-3.5',
                index < triggers.length - 1 && 'border-GRAY_400 border-b',
              )}
            >
              {content}
              <Switch size='medium' checked={trigger.enabled} onCheckedChange={() => handleToggle(trigger.id)} />
            </div>
          );
        })}
        {!onTriggerClick && (
          <div
            role='button'
            tabIndex={0}
            className='border-GRAY_400 hover:bg-GRAY_100 cursor-pointer border-t px-3.5 py-3 transition-colors'
            onClick={onAddTrigger}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAddTrigger?.();
              }
            }}
          >
            <div className='text-GRAY_700 f-13-500 flex items-center gap-1'>
              <Plus size={14} />
              <span>Add trigger</span>
            </div>
          </div>
        )}
      </div>
    </CommonWrapper>
  );
};

export default AgentTriggerList;
