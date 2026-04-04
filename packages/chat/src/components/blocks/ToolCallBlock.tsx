import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedTerminalIcon,
  ImageWithFallback,
  ScrollContainer,
  ShimmerText,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { safeJsonParse } from '@zamp-platform/utils';
import { AlertCircle, Play } from 'lucide-react';
import React, { FC, useCallback, useMemo, useState } from 'react';

import IntegrationCardV2 from '@/modules/integrations/AllIntegrations/IntegrationCardV2';
import type { IntegrationItem } from '@/types/api/integrations';

import { useChatActions } from '../../context/ChatActionsContext';
import type { ToolResultContentBlock, ToolUseDisplayContent } from '../../types/block.types';
import { buildIntegrationItemFromToolResult } from '../block.utils';
import { BROWSER_TOOL_DISPLAY_NAMES, TOOL_NAMES } from '../chat.constants';
import { CodePreviewBlock } from './CodePreviewBlock';

interface ToolCallBlockProps {
  payload: {
    display_content?: ToolUseDisplayContent;
    partial_json?: string;
    input_json?: string;
    tool_call_id?: string;
    name?: string;
    display_name?: string;
    icon?: string;
  };
  is_complete: boolean;
  toolResult?: ToolResultContentBlock;
  isAccordionOpen?: boolean;
  onAccordionOpenChange?: (isOpen: boolean) => void;
  showConnectorFromPrevious?: boolean;
  showConnectorToNext?: boolean;
  conversationId?: string;
}
export const ToolCallBlock: FC<ToolCallBlockProps> = ({
  payload,
  is_complete = true,
  toolResult,
  isAccordionOpen,
  onAccordionOpenChange,
  showConnectorFromPrevious = false,
  showConnectorToNext = false,
}) => {
  const [internalAccordionOpen, setInternalAccordionOpen] = useState<boolean>(false);
  const isControlled = typeof isAccordionOpen === 'boolean';
  const resolvedIsAccordionOpen = isControlled ? isAccordionOpen : internalAccordionOpen;
  const toolName = payload?.display_name || 'Unknown';
  const displayContent = safeJsonParse<{ tool_name?: string; icon?: string }>(payload?.display_content?.json_block);
  const name = payload?.name || displayContent?.tool_name;
  const icon = payload?.icon || displayContent?.icon;
  const { onWatchStream, isBrowserStreamingAvailable } = useChatActions();

  const isBrowserTool = useMemo(
    () => BROWSER_TOOL_DISPLAY_NAMES.some((n) => toolName.toLowerCase().includes(n.toLowerCase())),
    [toolName],
  );

  const toolResultData = safeJsonParse<{
    title?: string;
    integration_name?: string;
    metadata?: { redirect_url?: string };
    [key: string]: unknown;
  }>(toolResult?.payload?.content);

  const inputContent =
    payload?.display_content?.json_block || (!payload?.display_content && payload?.partial_json) || payload?.input_json;

  const handleValueChange = (value: string) => {
    const nextIsOpen = value === 'tool-use';
    onAccordionOpenChange?.(nextIsOpen);

    if (!isControlled) {
      setInternalAccordionOpen(nextIsOpen);
    }
  };

  const handleWatchToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onWatchStream?.({
        toolName,
        toolResult,
        isComplete: is_complete,
      });
    },
    [onWatchStream, toolName, toolResult, is_complete],
  );

  if (name === TOOL_NAMES.AUTHENTICATE_INTEGRATION_AND_CREATE_CONNECTION && toolResultData?.title) {
    const integrationItem = buildIntegrationItemFromToolResult(toolResultData) as IntegrationItem;
    return (
      <IntegrationCardV2
        className='my-6'
        integrationItem={integrationItem}
        redirectUrl={toolResultData?.metadata?.redirect_url}
        buttonVariant='default'
        isToolCallBlock
      />
    );
  }

  return (
    <Accordion
      type='single'
      collapsible
      value={resolvedIsAccordionOpen ? 'tool-use' : ''}
      onValueChange={handleValueChange}
      className='bg-BG_WHITE w-full overflow-hidden'
    >
      <AccordionItem value='tool-use' className='relative border-none'>
        {showConnectorFromPrevious && (
          <div className='bg-border pointer-events-none absolute top-0 left-[6.5px] z-0 h-2 w-px' />
        )}
        <AccordionTrigger className='font-420 text-GRAY_1000 w-full cursor-pointer gap-x-2 py-2 text-[13px] [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90'>
          <div className='flex flex-1 items-center gap-3'>
            <div className='flex items-center gap-x-2'>
              <div className='flex h-3.5 w-3.5 items-center justify-center'>
                {icon?.length ? (
                  <ImageWithFallback src={icon} alt={toolName} className='h-3 w-3' />
                ) : (
                  <AnimatedTerminalIcon showAnimation={!is_complete} size={14} />
                )}
              </div>

              {!is_complete ? (
                <ShimmerText text={toolName} autoAnimate={true} />
              ) : (
                <span
                  className={cn('font-420 text-[13px]', resolvedIsAccordionOpen ? 'text-GRAY_1000' : 'text-GRAY_950')}
                >
                  {toolName}
                </span>
              )}
            </div>

            {isBrowserTool && onWatchStream && isBrowserStreamingAvailable && (
              <button
                onClick={handleWatchToggle}
                className='text-GRAY_900 hover:bg-GRAY_50 ml-auto flex items-center gap-1 rounded-full px-1.5 py-1 transition-colors'
              >
                <Play size={10} className='fill-current' />
                <span className='f-11-500 whitespace-nowrap'>Watch</span>
              </button>
            )}

            {toolResult && toolResult.payload?.is_error && !isBrowserTool && (
              <div className='ml-auto flex items-center gap-1.5'>
                <AlertCircle className='text-destructive h-3.5 w-3.5' />
              </div>
            )}
          </div>
        </AccordionTrigger>
        {showConnectorToNext && (
          <div
            className={`bg-border pointer-events-none absolute left-[6.5px] z-0 w-px ${resolvedIsAccordionOpen ? 'top-[28px] bottom-0' : 'top-[28px] h-[14px]'}`}
          />
        )}
        <AccordionContent className='pt-0 pb-2'>
          <ScrollContainer className='max-h-60' scrollClassName='space-y-4 pr-2 pl-5'>
            <CodePreviewBlock label='Input' content={inputContent} />
            {toolResult && (
              <CodePreviewBlock
                label='Output'
                content={toolResult.payload?.content}
                isError={toolResult.payload?.is_error}
              />
            )}
          </ScrollContainer>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
