'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { CheckCircle, ChevronDown, Clock, Wrench } from 'lucide-react';
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
    <Accordion
      type='single'
      collapsible
      defaultValue='thinking'
      className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'
    >
      <AccordionItem value='thinking' className='border-none'>
        <AccordionTrigger className='f-12-450 text-GRAY_900 w-full gap-x-2 p-1.5 [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90'>
          <div className='flex flex-1 flex-col gap-2'>
            {!block.isComplete ? (
              <ShimmerText text={`${thinkingLabel}...`} autoAnimate={true} />
            ) : (
              <span className='f-12-450 text-GRAY_700 text-left'>{completedLabelWithDuration}</span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className='f-12-400 border-GRAY_100 text-GRAY_900 flex w-full overflow-y-auto border-t px-2 py-2 whitespace-pre-wrap [&::-webkit-scrollbar]:hidden'>
          {block.content || 'Processing...'}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
}> = ({ block }) => {
  const toolName = block.name || 'Unknown';

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue='tool-use'
      className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'
    >
      <AccordionItem value='tool-use' className='border-none'>
        <AccordionTrigger
          className='f-13-500 text-GRAY_900 w-full gap-x-2 px-3 py-2.5 hover:no-underline [&[data-state=closed]>svg]:rotate-0 [&[data-state=open]>svg]:rotate-180'
          icon={ChevronDown}
          iconRotation={180}
        >
          <div className='flex flex-1 items-center gap-3'>
            <Wrench className='text-GRAY_700 h-4 w-4' />
            <span className='text-GRAY_900'>{toolName}</span>
            {!block.isComplete ? (
              <span className='bg-GRAY_100 text-GRAY_900 f-12-450 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5'>
                <Clock className='text-GRAY_700 h-3.5 w-3.5' />
                Running
              </span>
            ) : (
              <span className='f-12-450 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5'>
                <CheckCircle className='h-3.5 w-3.5 text-green-700' />
                Completed
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className='border-GRAY_100 border-t px-3 pt-3 pb-3'>
          {block.displayContent && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Parameters</span>
              <div className='border-GRAY_200 overflow-x-auto rounded-lg border bg-gray-50 p-3'>
                <pre className='f-12-400 text-GRAY_700 break-all whitespace-pre-wrap'>
                  {block.displayContent.json_block}
                </pre>
              </div>
            </div>
          )}
          {!block.displayContent && block.partialJson && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Parameters</span>
              <div className='border-GRAY_200 overflow-x-auto rounded-lg border bg-gray-50 p-3'>
                <pre className='f-12-400 text-GRAY_700 break-all whitespace-pre-wrap'>{block.partialJson}</pre>
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
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
