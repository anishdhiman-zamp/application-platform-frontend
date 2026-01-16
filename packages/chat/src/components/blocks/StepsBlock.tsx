'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedDot,
  AnimatedTerminalIcon,
  ShimmerText,
} from '@zamp-platform/ui';
import { AlertCircle, ChevronDown } from 'lucide-react';
import React, { FC, useState } from 'react';

import {
  BLOCK_TYPE,
  type ThinkingContentBlock,
  type ToolResultContentBlock,
  type ToolUseContentBlock,
} from '../../types/block.types';
import { formatThinkingDuration } from '../block.utils';
import { CodePreviewBlock } from './CodePreviewBlock';
import { StatusLabel } from './StatusLabel';

type StepBlock = ThinkingContentBlock | ToolUseContentBlock;

interface StepsBlockProps {
  blocks: StepBlock[];
  toolResultsMap: Map<string, ToolResultContentBlock>;
}

export const StepsBlock: FC<StepsBlockProps> = ({ blocks, toolResultsMap }) => {
  const [accordionValue, setAccordionValue] = useState<string>('');

  const getStepIcon = (block: StepBlock) => {
    const isComplete = block.is_complete !== false;

    if (block.type === BLOCK_TYPE.THINKING) {
      return <AnimatedDot showAnimation={!isComplete} size={8} />;
    }

    if (block.type === BLOCK_TYPE.TOOL_USE) {
      return <AnimatedTerminalIcon showAnimation={!isComplete} size={12} />;
    }

    return null;
  };

  const renderStepTrigger = (block: StepBlock) => {
    if (block.type === BLOCK_TYPE.THINKING) {
      const thinkingBlock = block as ThinkingContentBlock;
      const thinkingDuration = formatThinkingDuration(thinkingBlock.start_timestamp, thinkingBlock.stop_timestamp);
      const completedLabel = thinkingDuration ? `Thought for ${thinkingDuration}` : 'Thought';
      const isComplete = block.is_complete !== false;

      return <StatusLabel isComplete={isComplete} loadingText='Thinking...' completedText={completedLabel} />;
    }

    if (block.type === BLOCK_TYPE.TOOL_USE) {
      const toolUseBlock = block as ToolUseContentBlock;
      const toolName = toolUseBlock.payload?.display_name || 'Unknown';
      const toolCallId = toolUseBlock.payload?.tool_call_id || toolUseBlock.id;
      const toolResult = toolCallId ? toolResultsMap.get(toolCallId) : undefined;
      const isComplete = toolUseBlock.is_complete !== false;

      return (
        <div className='flex flex-1 items-center gap-3'>
          {!isComplete ? (
            <ShimmerText text={toolName} autoAnimate={true} />
          ) : (
            <span className='text-GRAY_900'>{toolName}</span>
          )}
          {toolResult && toolResult.payload?.is_error && (
            <div className='ml-auto flex items-center gap-1.5'>
              <AlertCircle className='h-3.5 w-3.5 text-red-500' />
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderStepContent = (block: StepBlock) => {
    if (block.type === BLOCK_TYPE.THINKING) {
      const thinkingBlock = block as ThinkingContentBlock;
      return (
        <div className='f-12-400 text-GRAY_900 whitespace-pre-wrap'>
          {thinkingBlock.payload?.thinking || 'Processing...'}
        </div>
      );
    }

    if (block.type === BLOCK_TYPE.TOOL_USE) {
      const toolUseBlock = block as ToolUseContentBlock;
      const toolCallId = toolUseBlock.payload?.tool_call_id || toolUseBlock.id;
      const toolResult = toolCallId ? toolResultsMap.get(toolCallId) : undefined;
      const payload = toolUseBlock.payload;

      const inputContent =
        payload?.display_content?.json_block ||
        (!payload?.display_content && payload?.partial_json) ||
        payload?.input_json;

      return (
        <div className='space-y-4'>
          <CodePreviewBlock label='Input' content={inputContent} />
          {toolResult && (
            <CodePreviewBlock
              label='Output'
              content={toolResult.payload?.content}
              isError={toolResult.payload?.is_error}
            />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'>
      <Accordion type='single' collapsible value={accordionValue} onValueChange={setAccordionValue}>
        {blocks.map((block, index) => {
          const isLast = index === blocks.length - 1;
          const isFirst = index === 0;
          const stepIcon = getStepIcon(block);

          return (
            <AccordionItem key={`step-${index}`} value={`step-${index}`} className='relative border-none'>
              {!isFirst && (
                <div
                  className='bg-GRAY_500 pointer-events-none absolute top-0 left-[19.5px] h-[6px] w-px'
                  style={{ zIndex: 0 }}
                />
              )}
              <AccordionTrigger
                icon={ChevronDown}
                iconRotation={180}
                className='f-12-450 text-GRAY_900 w-full cursor-pointer gap-x-2 py-2 pr-2 pl-3 hover:bg-gray-50 hover:no-underline [&[data-state=closed]>svg]:rotate-0 [&[data-state=open]>svg]:rotate-180'
              >
                <div className='z-10 flex flex-1 items-center gap-2'>
                  <div className='flex h-4 w-4 shrink-0 items-center justify-center'>{stepIcon}</div>
                  {renderStepTrigger(block)}
                </div>
              </AccordionTrigger>
              <AccordionContent className='bg-GRAY_50 max-h-60 overflow-y-auto py-2 pr-2 pl-11 [scrollbar-width:thin]'>
                {renderStepContent(block)}
              </AccordionContent>

              {!isLast && (
                <div
                  className='bg-GRAY_500 pointer-events-none absolute top-[26px] bottom-0 left-[19.5px] w-px'
                  style={{ zIndex: 0 }}
                />
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
