'use client';

import { TASK_STATUS, TaskStatusIcon } from '@zamp-platform/chat';
import { getAgentAvatar, getAgentAvatarByKey } from 'modules/pace/components/agents/constants/agents.constants';
import type { AgentType } from 'modules/pace/components/agents/types/agents.types';
import TooltipV2 from '@/components/common/TooltipV2';
import ImageKitImage from '@/components/ImageKitImage';
import AgentCardTriggerDropdown from '@/modules/pace/components/agents/components/AgentCardTriggerDropdown';
import { formatCompactNumber } from '@/modules/pace/components/agents/utils/agents.utils';

interface AgentCardProps {
  agent: AgentType;
  onClick?: (agent: AgentType) => void;
}

const AgentCard = ({ agent, onClick }: AgentCardProps) => {
  const avatar = (agent.avatar && getAgentAvatarByKey(agent.avatar)) || getAgentAvatar(agent.name);

  return (
    <div
      className='bg-BG_WHITE border-GRAY_400 [&:not(:has([data-trigger-btn]:hover))]:hover:bg-BG_GRAY_2 flex min-h-32 cursor-pointer flex-col items-start justify-between rounded-xl border p-3.5 transition-colors'
      onClick={() => onClick?.(agent)}
    >
      <div className='flex w-full flex-col gap-2'>
        <div className='flex w-full items-center'>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <div className='relative flex shrink-0 items-center justify-center'>
              <ImageKitImage src={avatar.src} alt={avatar.alt} width={16} height={16} className='object-contain' />
            </div>
            <TooltipV2 tooltipBody={agent?.name ?? ''} className='min-w-0' showOnlyWhenTruncated>
              <p className='text-GRAY_1000 f-14-550 truncate'>{agent.name}</p>
            </TooltipV2>
          </div>
        </div>
        <p className='text-GRAY_700 f-12-450 line-clamp-2'>{agent?.description ?? ''}</p>
      </div>

      <div className='flex w-full flex-wrap items-start justify-between gap-1.5 pt-5'>
        <div className='flex min-w-0 flex-wrap items-center justify-start gap-x-1.5 gap-y-1'>
          {agent?.needs_review_count > 0 && (
            <div className='flex items-center gap-1 rounded px-1'>
              <TaskStatusIcon status={TASK_STATUS.NEEDS_INPUT} />
              <span className='text-GRAY_1000 text-xs leading-normal font-medium'>
                {formatCompactNumber(agent?.needs_review_count)}
              </span>
            </div>
          )}
          {agent?.conversations_count > 0 && (
            <div className='flex items-center gap-1 rounded px-1'>
              <TaskStatusIcon status={TASK_STATUS.IN_PROGRESS} />
              <span className='text-GRAY_1000 text-xs leading-normal font-medium'>
                {formatCompactNumber(agent?.conversations_count)}
              </span>
            </div>
          )}
          {agent?.completed_count > 0 && (
            <div className='flex items-center gap-1 rounded px-1'>
              <TaskStatusIcon status={TASK_STATUS.COMPLETED} />
              <span className='text-GRAY_1000 text-xs leading-normal font-medium'>
                {formatCompactNumber(agent?.completed_count)}
              </span>
            </div>
          )}
        </div>
        <AgentCardTriggerDropdown
          agentId={agent?.id ?? ''}
          agentName={agent?.name ?? ''}
          triggerCount={agent?.trigger_count ?? 0}
        />
      </div>
    </div>
  );
};

export default AgentCard;
