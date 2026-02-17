'use client';

import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/hooks/toolkit';
import PaceIcon from '@/modules/knowledge-based/icons/PaceIcon';
import { cn } from '@/utils/common';

// Lazy load chat input - not needed for initial paint
const KbChatInput = dynamic(() => import('@/modules/knowledge-based/chatbot/KbChatInput'), {
  ssr: false,
});

interface KnowledgeBaseChatInputProps {
  onSubmit: (message: string) => void;
  isChatbotExpanded?: boolean;
}

/**
 * Fixed-position chat input for knowledge base interactions
 * Handles focus states and responsive width adjustments
 */
const KnowledgeBaseChatInput: FC<KnowledgeBaseChatInputProps> = ({ onSubmit, isChatbotExpanded }) => {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const { isSidebarOpen } = useAppSelector((state) => state.layoutConfig);

  const isExpanded = isInputFocused || inputValue.length > 0;

  return (
    <div
      className={cn('fixed right-0 bottom-0 z-1000 m-auto w-full transition-opacity duration-400', {
        'opacity-100': !isChatbotExpanded,
        'pointer-events-none opacity-0': isChatbotExpanded,
        'w-[calc(100vw-241px)]': isSidebarOpen,
        'w-full': !isSidebarOpen,
      })}
    >
      <div className='bg-gradient-to-transparent w-full pb-6'>
        <KbChatInput
          onSubmit={onSubmit}
          className={cn('mx-auto w-full transition-all duration-400', {
            'w-[672px]': isExpanded,
            'w-[436px]': !isExpanded,
          })}
          inputValue={inputValue}
          setInputValue={setInputValue}
          textWrapperClassName='flex pt-0 items-end'
          textAreaClassName='!pt-3 pb-3 !min-h-[26px]'
          placeholderClassName='!top-4'
          sendButtonClassName='!p-3'
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder={
            <div className='-mt-1 flex items-center gap-1'>
              Ask away or give feedback to
              <PaceIcon height={12} width={12} />
              Pace
            </div>
          }
        />
      </div>
    </div>
  );
};

export default KnowledgeBaseChatInput;
