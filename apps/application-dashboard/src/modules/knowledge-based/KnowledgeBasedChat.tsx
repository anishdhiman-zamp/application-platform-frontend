'use client';

import { useRef, useState } from 'react';
import { type ImperativePanelHandle, ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import KbChatbot from '@/modules/knowledge-based/chatbot/KbChatbot';
import MarkdownRendererWithNavigation from '@/modules/knowledge-based/MarkdownRendererWithNavigation';
import type { defaultFnType } from '@/types/commonTypes';

interface KnowledgeBasedChatProps {
  onClose?: defaultFnType;
  userMessage: string;
  title: string;
}

export default function KnowledgeBasedChat({ onClose, userMessage, title }: KnowledgeBasedChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<ImperativePanelHandle>(null);

  const handleDragging = (dragging: boolean) => setIsDragging(dragging);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div className='flex h-full w-full flex-col'>
      <ResizablePanelGroup direction='horizontal' className='flex-grow'>
        <ResizablePanel
          id='chatbot'
          order={1}
          defaultSize={100}
          minSize={0}
          maxSize={100}
          className={cn('transition-all duration-300 ease-in-out', {
            'transition-none': isDragging,
          })}
          ref={panelRef}
        >
          <div className='h-full w-full'>
            <KbChatbot onClose={onClose} userMessage={userMessage} title={title} />
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          disabled={isExpanded}
          onDragging={handleDragging}
          className={cn('group cursor-col-resize', {
            'cursor-default': isExpanded,
            'bg-black': isDragging && !isExpanded,
            'opacity-0': isExpanded && !isDragging,
            'opacity-100': !isExpanded && !isDragging,
            'transition-opacity duration-300 ease-in-out': !isDragging,
          })}
          handleClassName={cn('bg-white', {
            'bg-black border-black': isDragging,
            'opacity-0 group-hover:opacity-100': !isDragging,
          })}
          onDoubleClick={() => toggleExpand()}
        />
        <ResizablePanel
          id='renderer'
          order={2}
          defaultSize={0}
          minSize={0}
          maxSize={100}
          className={cn('transition-all duration-300 ease-in-out', {
            'transition-none!': isDragging,
          })}
        >
          <div className='w-full overflow-y-auto px-4 pt-3'>
            <div className='m-auto h-[calc(100vh-96px)] max-w-[672px]'>
              <MarkdownRendererWithNavigation hideNav />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
