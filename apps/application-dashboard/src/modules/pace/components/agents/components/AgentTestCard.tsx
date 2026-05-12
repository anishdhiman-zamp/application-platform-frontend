'use client';

import { type FC, useCallback, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { ArrowUpRight, Bot } from 'lucide-react';
import {
  type AgentAvatarConfig,
  PrefixMessage,
  TRANSPARENT_PIXEL,
} from 'modules/pace/components/agents/constants/agents.constants';
import { useLazyGetAgentTriggersQuery } from '@/apis/agents';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import ImageKitImage from '@/components/ImageKitImage';
import type { AgentTriggerType } from '@/modules/pace/components/agents/types/agents.types';
import { useTriggerChatMessageFromButton } from '@/modules/pace/hooks/useTriggerChatMessageFromButton';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceActionsContext, usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';
import { cn } from '@/utils/common';

interface AgentTestCardProps {
  agentId: string;
  agentName: string;
  avatar: AgentAvatarConfig;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  onTriggerSelected?: () => void;
}

const AgentTestCard: FC<AgentTestCardProps> = ({
  agentId,
  agentName,
  avatar,
  className,
  disabled,
  onClick,
  onTriggerSelected,
}) => {
  const { setChatSidebarState } = usePaceLayoutContext();
  const { startNewChat } = usePaceActionsContext();
  const { setChatMessageIntent } = usePaceConversationContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [triggers, setTriggers] = useState<AgentTriggerType[]>([]);
  const [fetchTriggers, { isFetching: isLoadingTriggers }] = useLazyGetAgentTriggersQuery();
  const { triggerChatMessage } = useTriggerChatMessageFromButton({ agentId, agentName, agentAvatar: avatar?.key });

  const handleTestClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isExpanded) {
        setIsExpanded(false);

        return;
      }

      try {
        const result = await fetchTriggers({ agentId }).unwrap();
        const fetchedTriggers = result?.triggers ?? [];

        if (fetchedTriggers.length === 0) {
          onTriggerSelected?.();
          triggerChatMessage(`${PrefixMessage.TEST_AGENT} **${agentName}**`);

          return;
        }

        setTriggers(fetchedTriggers);
        setIsExpanded(true);
      } catch {
        onTriggerSelected?.();
        triggerChatMessage(`${PrefixMessage.TEST_AGENT} **${agentName}**`);
      }
    },
    [agentId, agentName, isExpanded, fetchTriggers, triggerChatMessage, onTriggerSelected],
  );

  const handleTriggerClick = useCallback(
    (trigger: AgentTriggerType) => {
      onTriggerSelected?.();

      const params = new URLSearchParams(window.location.search);
      const hasExistingConversation = Boolean(params.get(SIDEBAR_CONVERSATION_ID_PARAM));

      if (!hasExistingConversation) {
        startNewChat();
      }

      setChatMessageIntent({
        message: `Run trigger: ${trigger?.title}`,
        metadata: { agent_id: agentId, trigger_id: trigger?.id },
      });
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    },
    [agentId, startNewChat, setChatMessageIntent, setChatSidebarState, onTriggerSelected],
  );

  return (
    <div className={cn('flex flex-col', className)}>
      <div
        className='hover:bg-BG_GRAY_2 group/agent-test-card flex cursor-pointer items-center justify-between p-3 transition-colors'
        onClick={onClick}
      >
        <div className='flex min-w-0 flex-1 items-center gap-2'>
          <div className='text-GRAY_700 flex size-4 shrink-0 items-center justify-center'>
            <Bot size={16} />
          </div>
          <span className='f-13-500 text-GRAY_1000 min-w-0 truncate'>{agentName}</span>
          <ArrowUpRight
            size={14}
            className='text-GRAY_700 shrink-0 opacity-0 transition-opacity group-hover/agent-test-card:opacity-100'
          />
        </div>

        <div className='ml-2 flex shrink-0 items-center gap-3' data-agent-test-card-controls>
          <Button
            variant='outline'
            size='small'
            isLoading={isLoadingTriggers}
            disabled={disabled}
            tabIndex={-1}
            className='invisible h-7 shrink-0 rounded-lg px-3 text-xs'
            onClick={handleTestClick}
          >
            Test
          </Button>
          <div className='flex size-3.5 shrink-0 items-center justify-center'>
            <ImageKitImage
              src={avatar.src}
              alt={avatar.alt}
              width={14}
              height={14}
              className='size-full object-contain'
            />
          </div>
        </div>
      </div>

      {isExpanded && triggers.length > 0 && (
        <div className='overflow-hidden'>
          <div className='bg-GRAY_100 mt-0.5 overflow-hidden rounded-xl p-0.5'>
            <div className='border-GRAY_400 bg-BG_WHITE flex flex-col gap-1.5 overflow-hidden rounded-xl border p-3'>
              <p className='text-GRAY_700 f-12-450'>To test the agent, Please select a trigger:</p>
              <div className='max-h-[200px] overflow-y-auto'>
                {triggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    role='button'
                    className='hover:bg-GRAY_100 flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors'
                    onClick={() => handleTriggerClick(trigger)}
                  >
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTestCard;
