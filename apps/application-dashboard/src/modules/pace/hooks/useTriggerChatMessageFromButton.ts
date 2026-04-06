import { useCallback } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

interface UseTriggerChatMessageFromButtonParams {
  agentId: string;
  agentName: string;
}

export const useTriggerChatMessageFromButton = ({ agentId, agentName }: UseTriggerChatMessageFromButtonParams) => {
  const { chatSidebarState, setChatSidebarState, startNewChat, setChatMessageIntent, setActiveAgentInfo } =
    usePaceContext();

  const triggerChatMessage = useCallback(
    (message: string) => {
      const params = new URLSearchParams(window.location.search);
      const hasExistingConversation = Boolean(params.get(SIDEBAR_CONVERSATION_ID_PARAM));

      if (!hasExistingConversation) {
        startNewChat();
        setActiveAgentInfo({ id: agentId, name: agentName });
      }

      setChatMessageIntent({
        message,
        metadata: { agent_id: agentId },
      });

      if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
    },
    [agentId, agentName, chatSidebarState, startNewChat, setChatMessageIntent, setActiveAgentInfo, setChatSidebarState],
  );

  return { triggerChatMessage };
};
