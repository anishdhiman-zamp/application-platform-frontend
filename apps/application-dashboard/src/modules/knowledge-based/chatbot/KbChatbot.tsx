import { useEffect, useRef, useState } from 'react';
import { API_DOMAIN } from '@zamp-platform/api';
import {
  AnnotationType,
  type ChatMessage,
  ChatMessageType,
  ResourceType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { ShimmerText, toast } from '@zamp-platform/ui';
import PaceIcon from 'modules/knowledge-based/icons/PaceIcon';
import KnowledgeBasedTopbar from 'modules/knowledge-based/KnowledgeBasedTopbar';
import { useParams } from 'next/navigation';
import ChatCard from '@/modules/knowledge-based/chatbot/ChatCard';
import KbChatInput from '@/modules/knowledge-based/chatbot/KbChatInput';
import type { defaultFnType } from '@/types/commonTypes';

interface KbChatbotProps {
  onClose?: defaultFnType;
  userMessage: string;
  title: string;
}

const KbChatbot = ({ onClose, userMessage, title }: KbChatbotProps) => {
  const params = useParams();
  const processId = params?.processId as string;

  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleScroll = () => {
    if (chat.messages?.length && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const chat = useChat({
    reconnectIntervalMs: 30000,
    maxReconnectAttempts: 5,
    onNewMessage: () => {
      setIsLoading(false);
    },
  });

  const handleClose = () => {
    onClose?.();
    chat.disconnect();
    chat.clearMessages();
  };

  useEffect(() => {
    const init = async () => {
      const conversationId = await chat.createConversation({
        resource_id: processId,
        resource_type: ResourceType.PROCESS,
        annotation_type: AnnotationType.KB,
        message_content: {
          message: userMessage || 'Hello, how are you?',
        },
      });

      setIsLoading(true);

      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }
      chat.connect(`${API_DOMAIN}/conversations/events/${conversationId}`);
    };

    if (userMessage) {
      init();
    }

    return () => chat.disconnect();
  }, [userMessage]);

  const handleSendMessage = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    setTimeout(() => {
      setIsLoading(true);
    }, 500);

    const messagePayload = {
      resource_id: processId,
      resource_type: ResourceType.PROCESS,
      message_content: {
        message: inputValue,
      },
      message_type: ChatMessageType.TEXT,
      sender_type: SenderType.USER,
      timestamp: new Date().toISOString(),
      metadata: {},
    };

    setInputValue('');

    try {
      await chat.sendMessage(messagePayload);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    handleScroll();
  }, [chat.messages, isLoading]);

  return (
    <div className='m-auto flex h-full w-full flex-col items-start justify-start'>
      <KnowledgeBasedTopbar onClose={handleClose} title={title} />
      <div className='w-full flex-grow overflow-y-auto px-12' ref={containerRef}>
        <div className='m-auto max-w-[672px] flex-grow overflow-y-auto'>
          <div className='flex flex-col gap-8 py-10'>
            {chat?.messages?.map((message: ChatMessage, idx: number) => (
              <ChatCard
                key={`${message?.message_content}-${idx}`}
                message={message?.message_content?.message}
                senderType={message?.sender_type}
              />
            ))}
            {chat?.state?.error && <div className='text-red-500'>{chat?.state?.error}</div>}
            {isLoading && (
              <div className='flex h-full w-full items-center gap-1.5 text-gray-700'>
                <PaceIcon height={12} width={12} />
                <ShimmerText text='Pace is searching across the knowledge base...' autoAnimate={true} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='w-full px-12 pb-12'>
        <KbChatInput
          disabled={isLoading}
          messageCount={chat?.messages?.length}
          onSubmit={handleSendMessage}
          className='m-auto w-full max-w-[672px]'
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      </div>
    </div>
  );
};

export default KbChatbot;
