import { useCallback } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceActionsContext, usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE } from '@/modules/pace/pace.types';

interface UseTriggerChatMessageFromButtonParams {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
}

export const useTriggerChatMessageFromButton = ({
  agentId,
  agentName,
  agentAvatar,
}: UseTriggerChatMessageFromButtonParams) => {
  const { chatSidebarState, setChatSidebarState } = usePaceLayoutContext();
  const { setChatMessageIntent, setActiveAgentInfo } = usePaceConversationContext();
  const { startNewChat } = usePaceActionsContext();

  const triggerChatMessage = useCallback(
    (message: string) => {
      const params = new URLSearchParams(window.location.search);
      const hasExistingConversation = Boolean(params.get(SIDEBAR_CONVERSATION_ID_PARAM));

      if (!hasExistingConversation) {
        startNewChat();
        setActiveAgentInfo({ id: agentId, name: agentName, avatar: agentAvatar });
      }

      setChatMessageIntent({
        message,
        metadata: { agent_id: agentId, ...(agentAvatar && { avatar: agentAvatar }) },
      });

      if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
    },
    [
      agentId,
      agentName,
      agentAvatar,
      chatSidebarState,
      startNewChat,
      setChatMessageIntent,
      setActiveAgentInfo,
      setChatSidebarState,
    ],
  );

  return { triggerChatMessage };
};
