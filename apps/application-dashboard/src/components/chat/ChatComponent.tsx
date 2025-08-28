'use client';

import React, { useEffect, useState } from 'react';
import { AnnotationType, ChatMessage, ChatMessageType, ResourceType, SenderType, useChat } from '@zamp-platform/chat';
import { useAppSelector } from 'hooks/toolkit';
import { RootState } from 'store';
import { useSSEContext } from '@/contexts/SSEContext';

interface ChatComponentProps {
  type: AnnotationType;
  className?: string;
  resourceId: string;
  resourceType: ResourceType;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({ type, className = '', resourceId, resourceType }) => {
  const [inputValue, setInputValue] = useState('');
  const user = useAppSelector((state: RootState) => state.user.user);
  const sseContext = useSSEContext();

  const chat = useChat({
    onNewMessage: (message: ChatMessage) => {
      console.log('New message:', message);
    },
  });

  useEffect(() => {
    const init = async () => {
      const conversationId = await chat.createConversation({
        resource_id: resourceId,
        resource_type: resourceType,
        annotation_type: type,
        message_content: {
          message: 'Hello, how are you?',
        },
      });

      console.log('Conversation ID:', conversationId);
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }
    };

    init();
  }, []);

  if (!user?.user_id) {
    return (
      <div className={`chat-component ${className}`}>
        <div className='p-4 text-center text-gray-500'>Please log in to use the chat feature.</div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const messagePayload = {
      resource_id: resourceId,
      resource_type: resourceType,
      message_content: {
        message: inputValue,
      },
      message_type: ChatMessageType.TEXT,
      sender_type: SenderType.USER,
      timestamp: new Date().toISOString(),
      metadata: {},
    };

    try {
      await chat.sendMessage(messagePayload);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`chat-component ${className}`}>
      <div className='messages-container mb-4 max-h-96 overflow-y-auto rounded-lg border border-gray-300 p-4'>
        {chat.messages.length === 0 ? (
          <div className='text-center text-gray-500'>Start a conversation</div>
        ) : (
          chat.messages.map((message: ChatMessage, idx: number) => (
            <div key={idx} className='message mb-3 rounded bg-gray-50 p-2'>
              <div className='message-header mb-1 flex items-center justify-between'>
                <strong className='text-sm font-medium'>{message.sender_type}</strong>
                <span className='text-xs text-gray-500'>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className='message-content text-sm'>{message.message_content.message}</div>
            </div>
          ))
        )}
      </div>

      <div className='input-area flex gap-2'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder='Type a message...'
          className='flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
          disabled={!sseContext?.state?.isConnected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || !sseContext?.state?.isConnected}
          className='rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'
        >
          Send
        </button>
      </div>

      <div className='status-bar mt-2 text-xs text-gray-500'>
        Status:{' '}
        {sseContext?.state?.isConnected ? (
          <span className='text-green-600'>Connected</span>
        ) : sseContext?.state?.isConnecting ? (
          <span className='text-yellow-600'>Connecting...</span>
        ) : (
          <span className='text-red-600'>Disconnected</span>
        )}
        {sseContext?.state?.error && <span className='ml-2 text-red-600'>Error: {sseContext?.state?.error}</span>}
      </div>
    </div>
  );
};

export default ChatComponent;
