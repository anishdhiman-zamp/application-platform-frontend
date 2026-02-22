'use client';

import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { kbChatVariants, kbContentVariants } from 'modules/knowledge-based/knowledge-base.constants';
import { motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { getBackgroundImageUrl } from '@/constants/icons';
import { useProcesses } from '@/contexts/ProcessesContext';
import { useAppSelector } from '@/hooks/toolkit';
import KbChatInput from '@/modules/knowledge-based/chatbot/KbChatInput';
import KBIcon from '@/modules/knowledge-based/icons/KBIcon';
import PaceIcon from '@/modules/knowledge-based/icons/PaceIcon';
import KnowledgeBaseChatWrapper from '@/modules/knowledge-based/KnowledgeBaseChatWrapper';
import MarkdownRendererWithNavigation from '@/modules/knowledge-based/MarkdownRendererWithNavigation';
import type { ProcessResponseType } from '@/types/api/processApi.types';

const KnowledgeBaseHome = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const processId = params?.processId as string;
  const { isSidebarOpen } = useAppSelector((state) => state.layoutConfig);

  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isChatbotExpanded, setIsChatbotExpanded] = useState(false);
  const [showKbContent, setShowKbContent] = useState(false);

  const { processes } = useProcesses();

  const handleSendMessage = () => {
    setIsChatbotExpanded(true);
  };

  const processName = useMemo(
    () => processes?.find((process: ProcessResponseType) => process?.process_id === processId)?.display_name,
    [processes, processId],
  );

  const handleExploreKbClick = () => {
    scrollRef.current?.scrollTo({
      top: 1,
      behavior: 'smooth',
    });
    setShowKbContent(true);
  };

  useEffect(() => {
    if (!isChatbotExpanded) {
      setInputValue('');
    }
  }, [isChatbotExpanded]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;

      const currentScrollY = scrollRef.current?.scrollTop;

      if (currentScrollY && currentScrollY > 30 && !showKbContent) {
        scrollRef.current?.scrollTo({
          top: 1,
          behavior: 'smooth',
        });

        setShowKbContent(true);
      } else if (currentScrollY === 0 && showKbContent) {
        setShowKbContent(false);
      }
    };

    const currentRef = scrollRef.current;

    currentRef?.addEventListener('scroll', handleScroll);

    return () => {
      currentRef?.removeEventListener('scroll', handleScroll);
    };
  }, [showKbContent]);

  return (
    <div ref={scrollRef} className='custom-scrollbar relative h-full w-full overflow-y-auto'>
      {/* Sticky top section */}
      <div className='sticky top-0 z-10 h-[calc(100vh-48px)] w-full'>
        <motion.div
          className='flex h-full w-full items-center justify-center bg-cover bg-center'
          style={{
            backgroundImage: getBackgroundImageUrl('/images/knowledge-base/kb-background.svg'),
          }}
          variants={kbChatVariants}
          animate={showKbContent ? 'hidden' : 'visible'}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className='flex h-full w-full flex-col'>
            <div className='flex h-full w-full flex-col items-center justify-center'>
              <div className='flex-grow'>
                <div className='flex h-full w-[672px] flex-col items-center justify-center'>
                  <div className='f-13-500 mb-9 flex items-center justify-center gap-1 rounded-full border border-blue-700 px-4 py-2 text-blue-700'>
                    <KBIcon /> Knowledge Base
                  </div>
                  <div className='f-22-550 mb-7 flex items-center gap-1 whitespace-nowrap select-none'>
                    Ask
                    <PaceIcon height={20} width={20} />
                    Pace anything about {processName ?? 'Process'}
                  </div>
                  <KbChatInput
                    placeholder='Ask away...'
                    onSubmit={handleSendMessage}
                    className='w-full max-w-[672px]'
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                  />
                </div>
              </div>
              <div
                className='flex cursor-pointer flex-col items-center justify-center gap-2 pb-8 text-gray-900'
                onClick={handleExploreKbClick}
              >
                <SvgSpriteLoader id='chevron-up-double' size={18} />
                <div className='f-13-500'>Explore Knowledge Base</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scrollable content that overlaps the sticky section */}
      <div
        className='relative z-20 w-full'
        style={{ marginTop: '-100vh', pointerEvents: showKbContent ? 'auto' : 'none' }}
      >
        <motion.div
          className='w-full bg-white'
          variants={kbContentVariants}
          initial='hidden'
          animate={showKbContent ? 'visible' : 'hidden'}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ pointerEvents: showKbContent ? 'auto' : 'none' }}
        >
          <div
            className='flex h-[260px] w-full items-center bg-cover bg-center'
            style={{
              backgroundImage: getBackgroundImageUrl('/images/knowledge-base/kb-content-background.svg'),
            }}
          >
            <div className='f-36-500 mx-auto max-w-[800px] flex-grow'>{processName}</div>
            <div className='h-[260px] w-[320px]' />
          </div>
          <MarkdownRendererWithNavigation scrollRef={scrollRef as RefObject<HTMLDivElement>} />
        </motion.div>
      </div>

      <div
        className={cn('fixed right-0 bottom-0 z-1000 m-auto w-full transition-opacity duration-400', {
          'opacity-100': showKbContent && !isChatbotExpanded,
          'pointer-events-none opacity-0': !showKbContent || isChatbotExpanded,
          'w-[calc(100vw-241px)]': isSidebarOpen,
          'w-full': !isSidebarOpen,
        })}
      >
        <div className='bg-gradient-to-transparent w-full pb-6'>
          <KbChatInput
            onSubmit={handleSendMessage}
            className={cn('mx-auto w-full transition-all duration-400', {
              'w-[672px]': isInputFocused || inputValue.length > 0,
              'w-[336px]': !isInputFocused && inputValue.length === 0,
            })}
            inputValue={inputValue}
            setInputValue={setInputValue}
            textWrapperClassName='flex pt-0 items-end'
            textAreaClassName='!pt-4 pb-4 !min-h-[26px]'
            placeholderClassName='!top-4'
            sendButtonClassName='!p-3'
            placeholder='Ask away...'
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
        </div>
      </div>

      <KnowledgeBaseChatWrapper
        userMessage={isChatbotExpanded ? inputValue : ''}
        title={processName ?? ''}
        isExpanded={isChatbotExpanded}
        onClose={() => setIsChatbotExpanded(false)}
      />
    </div>
  );
};

export default KnowledgeBaseHome;
