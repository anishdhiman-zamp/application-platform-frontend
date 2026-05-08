'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Switch,
  toast,
  TooltipV2,
} from '@zamp-platform/ui';
import { Zap } from 'lucide-react';
import { useGetAgentTriggersQuery, useToggleAgentTriggerMutation } from '@/apis/agents';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { TRANSPARENT_PIXEL } from '@/modules/pace/components/agents/constants/agents.constants';
import TriggerDropdownSkeleton from '@/modules/pace/components/agents/skeletons/TriggerDropdownSkeleton';
import type { AgentTriggerType } from '@/modules/pace/components/agents/types/agents.types';
import { formatCompactNumber } from '@/modules/pace/components/agents/utils/agents.utils';

interface AgentCardTriggerDropdownProps {
  agentId: string;
  agentName: string;
  triggerCount: number;
}

const AgentCardTriggerDropdown = ({ agentId, agentName, triggerCount }: AgentCardTriggerDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [localTriggers, setLocalTriggers] = useState<AgentTriggerType[] | null>(null);

  const { data, isLoading, isError, refetch } = useGetAgentTriggersQuery({ agentId }, { skip: !open });
  const [toggleTrigger] = useToggleAgentTriggerMutation();

  const triggers = localTriggers ?? data?.triggers ?? [];

  const handleToggle = useCallback(
    async (triggerId: string) => {
      const trigger = triggers.find((t) => t.id === triggerId);

      if (!trigger) return;

      const newActive = !trigger.enabled;
      const updated = triggers.map((t) => (t.id === triggerId ? { ...t, enabled: newActive } : t));

      setLocalTriggers(updated);

      try {
        await toggleTrigger({ agentId, triggerId, active: newActive }).unwrap();
        toast.success(`Trigger toggled for ${agentName}`);
      } catch {
        setLocalTriggers(triggers);
        toast.error('Failed to toggle trigger');
      }
    },
    [agentId, triggers, toggleTrigger],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (nextOpen && data) refetch();
    },
    [data, refetch],
  );

  // Sync local state when fresh data arrives from API
  useEffect(() => {
    if (data?.triggers) {
      setLocalTriggers(data.triggers);
    }
  }, [data?.triggers]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <TooltipV2 tooltipBody='Triggers' disabled={open} asChildTrigger>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            data-trigger-btn
            className='hover:bg-BG_GRAY_2 flex h-5 shrink-0 items-center gap-1 rounded px-1 transition-colors'
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            <Zap size={14} className='text-GRAY_700' />
            <span className='text-GRAY_700 text-xs leading-normal font-medium'>
              {formatCompactNumber(triggerCount)}
            </span>
          </Button>
        </PopoverTrigger>
      </TooltipV2>
      <PopoverPortal>
        <PopoverContent
          align='end'
          side='bottom'
          sideOffset={4}
          className='w-56 p-1'
          onClick={(e) => e.stopPropagation()}
        >
          <div className='flex flex-col'>
            <div className='px-2.5 py-2'>
              <span className='text-GRAY_700 f-12-500'>Triggers</span>
            </div>
            <div className='max-h-[150px] overflow-y-auto'>
              <CommonWrapper
                isLoading={isLoading}
                isError={isError}
                refetchFunction={refetch}
                isNoData={!isLoading && triggers.length === 0}
                noDataBanner={<div className='text-GRAY_700 f-12-450 px-2.5 py-3 text-center'>No triggers</div>}
                skeletonType={SkeletonTypes.CUSTOM}
                loader={<TriggerDropdownSkeleton />}
                disableAnimation
              >
                {triggers.map((trigger) => (
                  <div key={trigger.id} className='flex items-center gap-1.5 rounded-md px-2.5 py-2'>
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
                    <TooltipV2 tooltipBody={trigger.title} className='min-w-0 flex-1' showOnlyWhenTruncated>
                      <span className='text-GRAY_950 f-13-500 block truncate'>{trigger.title}</span>
                    </TooltipV2>
                    <Switch
                      size='medium'
                      checked={trigger.enabled}
                      onCheckedChange={() => handleToggle(trigger.id)}
                      className='shrink-0'
                    />
                  </div>
                ))}
              </CommonWrapper>
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default AgentCardTriggerDropdown;
