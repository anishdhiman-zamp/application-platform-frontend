'use client';

import { TASK_STATUS, TaskStatusIcon } from '@zamp-platform/chat';
import { Zap } from 'lucide-react';
import { getAgentAvatar, getAgentAvatarByKey } from 'modules/pace/components/agents/constants/agents.constants';
import type { AgentType } from 'modules/pace/components/agents/types/agents.types';
import TooltipV2 from '@/components/common/TooltipV2';
import ImageKitImage from '@/components/ImageKitImage';
import { formatCompactNumber } from '@/modules/pace/components/agents/utils/agents.utils';

interface AgentCardProps {
  agent: AgentType;
  onClick?: (agent: AgentType) => void;
}

const AgentCard = ({ agent, onClick }: AgentCardProps) => {
  const avatar = (agent.avatar && getAgentAvatarByKey(agent.avatar)) || getAgentAvatar(agent.name);

  return (
    <div
      className='bg-BG_WHITE border-GRAY_400 hover:bg-BG_GRAY_2 flex h-32 cursor-pointer flex-col items-start justify-between rounded-xl border p-3.5 transition-colors'
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

      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          {agent?.needs_review_count > 0 && (
            <div className='flex items-center gap-1 rounded px-1 py-0.5'>
              <TaskStatusIcon status={TASK_STATUS.NEEDS_INPUT} />
              <span className='text-GRAY_1000 text-xs leading-normal font-medium'>
                {formatCompactNumber(agent?.needs_review_count)}
              </span>
            </div>
          )}
          {agent?.conversations_count > 0 && (
            <div className='flex items-center gap-1 rounded px-1 py-0.5'>
              <TaskStatusIcon status={TASK_STATUS.IN_PROGRESS} />
              <span className='text-GRAY_1000 text-xs leading-normal font-medium'>
                {formatCompactNumber(agent?.conversations_count)}
              </span>
            </div>
          )}
          {agent?.completed_count > 0 && (
            <div className='flex items-center gap-1 rounded px-1 py-0.5'>
              <TaskStatusIcon status={TASK_STATUS.COMPLETED} />
              <span className='text-GRAY_1000 text-xs leading-normal font-medium'>
                {formatCompactNumber(agent?.completed_count)}
              </span>
            </div>
          )}
        </div>
        <div className='flex items-center gap-1 rounded px-1 py-0.5'>
          <Zap size={14} className='text-GRAY_700' />
          <span className='text-GRAY_700 text-xs leading-normal font-medium'>{agent?.trigger_count}</span>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
