import { useCallback } from 'react';
import { captureException } from '@sentry/browser';
import { ActionType, ButtonBlockType, ResourceType, useChat } from '@zamp-platform/chat';
import { toast } from '@zamp-platform/ui';
import { getInteractionPayload, getMessagePayload, updateMessageInArray } from 'modules/chatbot/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePostInteractionMutation } from '@/apis/interaction';

const useActionHub = (setIsLoading: (isLoading: boolean) => void) => {
  const [postInteraction] = usePostInteractionMutation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const runAction = useCallback(
    (blockConfig: ButtonBlockType, payload: Record<string, string>, chat: ReturnType<typeof useChat>) => {
      const actionType = blockConfig?.action?.type;

      switch (actionType) {
        case ActionType.INTERNAL_API:
          setIsLoading(true);
          if (blockConfig.action?.display_layer_action) {
            try {
              chat.sendMessage(getMessagePayload(blockConfig, payload), true);
            } catch (error) {
              captureException(error);
              toast.error('Failed to send message');
            }
          }
          postInteraction(getInteractionPayload(blockConfig, payload))
            .unwrap()
            .then((response) => {
              chat.setMessages((prevMessages) =>
                updateMessageInArray(response, prevMessages, payload.resourceType as ResourceType, payload.resourceId),
              );
            })
            .finally(() => {
              if (!blockConfig.action?.display_layer_action) {
                setIsLoading(false);
              }
            });
          break;
        case ActionType.INTERNAL_REDIRECT:
          if (blockConfig.action.action_id === 'open_feedback_queue') {
            router.push(`?${searchParams?.toString()}&feedback-status=true&tab=queued`);
          }
          break;
        default:
          throw new Error(`Unsupported action type: ${actionType}`);
      }
    },
    [postInteraction, router, searchParams],
  );

  return {
    runAction,
  };
};

export default useActionHub;
