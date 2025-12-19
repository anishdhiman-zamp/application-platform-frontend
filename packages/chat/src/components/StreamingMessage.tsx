'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FC, ReactNode, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import {
  ChatMessage,
  ChatMessageType,
  ResourceType,
  SenderType,
  StreamingContentBlock,
  StreamingContentType,
  StreamingState,
  TextContentBlock,
  ThinkingContentBlock,
  ToolUseContentBlock,
} from '../types/chat.types';
import SenderDetails from './SenderDetails';

export interface StreamingMessageProps {
  streamingState: StreamingState;
  assistantName?: string;
  assistantAvatar?: ReactNode;
  className?: string;
  thinkingLabel?: string;
  toolUseLabel?: string;
}

/**
 * Formats the thinking duration in a human-readable format
 */
const formatThinkingDuration = (startTimestamp?: string, stopTimestamp?: string): string | null => {
  if (!startTimestamp || !stopTimestamp) return null;

  const startTime = new Date(startTimestamp).getTime();
  const stopTime = new Date(stopTimestamp).getTime();
  const durationMs = stopTime - startTime;

  if (isNaN(durationMs) || durationMs < 0) return null;

  const seconds = Math.round(durationMs / 1000);
  if (seconds < 1) return 'less than 1 sec';
  if (seconds === 1) return '1 sec';
  return `${seconds} sec`;
};

/**
 * Component to render a thinking content block with "Working..." style and expandable content
 */
const ThinkingBlock: FC<{
  block: ThinkingContentBlock;
  thinkingLabel?: string;
  completedLabel?: string;
}> = ({ block, thinkingLabel = 'Thinking', completedLabel = 'Thought' }) => {
  const thinkingDuration = formatThinkingDuration(block.startTimestamp, block.stopTimestamp);
  const completedLabelWithDuration = thinkingDuration ? `${completedLabel} for ${thinkingDuration}` : completedLabel;

  return (
    <div className='w-full overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-white'>
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='thinking' className='border-none'>
          <AccordionTrigger
            className='flex w-full items-center justify-between px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180'
            iconRotation={180}
          >
            <div className='flex flex-1 flex-col gap-2'>
              {!block.isComplete ? (
                <ShimmerText text={`${thinkingLabel}...`} autoAnimate={true} />
              ) : (
                <span className='f-14-500 text-left text-blue-600'>{completedLabelWithDuration}</span>
              )}
              {!block.isComplete && (
                <div className='h-1 w-full overflow-hidden rounded-full bg-blue-100'>
                  <div className='h-full w-1/3 animate-pulse rounded-full bg-blue-500' />
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className='px-4 pt-0 pb-4'>
            <div className='f-12-400 max-h-60 overflow-y-auto rounded-md bg-white p-3 whitespace-pre-wrap text-gray-600 shadow-inner'>
              {block.content || 'Processing...'}
              {!block.isComplete && <span className='animate-pulse'>▊</span>}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

/**
 * Component to render a text content block with markdown support
 */
const TextBlock: FC<{
  block: TextContentBlock;
}> = ({ block }) => {
  return (
    <div className='prose prose-sm f-13-450 text-gray-1000 max-w-none'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href, ...props }) => {
            if (!href) return null;
            return (
              <Link href={href} className='text-blue-700'>
                {props.children}
              </Link>
            );
          },
        }}
      >
        {block.content}
      </ReactMarkdown>
    </div>
  );
};

/**
 * Component to render a tool use content block using Accordion
 */
const ToolUseBlock: FC<{
  block: ToolUseContentBlock;
  toolUseLabel?: string;
}> = ({ block, toolUseLabel = 'Using tool' }) => {
  const displayMessage = block.message || `${toolUseLabel}: ${block.name || 'Unknown'}`;

  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50'>
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='tool-use' className='border-none'>
          <AccordionTrigger
            className='flex-row-reverse justify-end gap-2 px-3 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-90'
            icon={ChevronRight}
            iconRotation={90}
          >
            <div className='flex flex-1 items-center gap-2'>
              {!block.isComplete ? (
                <Loader2 className='h-4 w-4 animate-spin text-blue-500' />
              ) : (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-4 w-4 cursor-default rounded-full bg-green-500 p-0 hover:bg-green-500'
                  asChild
                >
                  <span>
                    <Check className='h-2.5 w-2.5 text-white' strokeWidth={3} />
                  </span>
                </Button>
              )}
              <span className='f-13-500 text-gray-700'>{displayMessage}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className='px-3 pt-0 pb-3'>
            {block.displayContent && (
              <div className='overflow-x-auto rounded bg-gray-100 p-2'>
                <pre className='f-11-400 break-all whitespace-pre-wrap text-gray-600'>
                  {block.displayContent.json_block}
                </pre>
              </div>
            )}
            {!block.displayContent && block.partialJson && (
              <div className='overflow-x-auto rounded bg-gray-100 p-2'>
                <pre className='f-11-400 break-all whitespace-pre-wrap text-gray-600'>
                  {block.partialJson}
                  {!block.isComplete && <span className='animate-pulse'>▊</span>}
                </pre>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

/**
 * Renders a single content block based on its type
 */
const ContentBlockRenderer: FC<{
  block: StreamingContentBlock;
  thinkingLabel?: string;
  toolUseLabel?: string;
}> = ({ block, thinkingLabel, toolUseLabel }) => {
  switch (block.type) {
    case StreamingContentType.THINKING:
      return <ThinkingBlock block={block} thinkingLabel={thinkingLabel} />;
    case StreamingContentType.TEXT:
      return <TextBlock block={block} />;
    case StreamingContentType.TOOL_USE:
      return <ToolUseBlock block={block} toolUseLabel={toolUseLabel} />;
    default:
      return null;
  }
};

/**
 * StreamingMessage component renders the streaming state from agent_streams SSE events.
 * It displays thinking, text, and tool_use content blocks as they stream in.
 */
export const StreamingMessage: FC<StreamingMessageProps> = ({
  streamingState,
  assistantName = 'Assistant',
  assistantAvatar,
  className,
  thinkingLabel = 'Thinking',
  toolUseLabel = 'Using tool',
}) => {
  // Create a minimal assistant message for SenderDetails
  const assistantMessage = useMemo<ChatMessage>(
    () => ({
      resource_type: ResourceType.ORGANIZATION,
      resource_id: '',
      message_content: {},
      message_type: ChatMessageType.TEXT,
      sender_type: SenderType.ASSISTANT,
      metadata: {},
      timestamp: new Date().toISOString(),
    }),
    [],
  );

  if (!streamingState || streamingState.contentBlocks.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Sender details */}
      <SenderDetails message={assistantMessage} assistantName={assistantName} assistantAvatar={assistantAvatar} />

      {/* Content blocks */}
      <div className='space-y-3'>
        {streamingState.contentBlocks.map((block) => (
          <ContentBlockRenderer
            key={`${block.type}-${block.index}`}
            block={block}
            thinkingLabel={thinkingLabel}
            toolUseLabel={toolUseLabel}
          />
        ))}
      </div>
    </div>
  );
};

export default StreamingMessage;
