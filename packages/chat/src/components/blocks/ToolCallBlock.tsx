import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedTerminalIcon,
  ImageWithFallback,
  ShimmerText,
} from '@zamp-platform/ui';
import { safeJsonParse } from '@zamp-platform/utils';
import { AlertCircle } from 'lucide-react';
import React, { FC } from 'react';

import IntegrationCardV2 from '@/modules/integrations/AllIntegrations/IntegrationCardV2';
import type { IntegrationItem } from '@/types/api/integrations';

import type { ToolResultContentBlock, ToolUseDisplayContent } from '../../types/block.types';
import { buildIntegrationItemFromToolResult } from '../block.utils';
import { TOOL_NAMES } from '../chat.constants';
import { CodePreviewBlock } from './CodePreviewBlock';

/**
 * Component to render a tool use content block with optional tool result using Accordion
 */
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
}
export const ToolCallBlock: FC<ToolCallBlockProps> = ({ payload, is_complete = true, toolResult }) => {
  const toolName = payload?.display_name || 'Unknown';
  const displayContent = safeJsonParse<{ tool_name?: string; icon?: string }>(payload?.display_content?.json_block);
  const name = payload?.name || displayContent?.tool_name;
  const icon = payload?.icon || displayContent?.icon;

  const toolResultData = safeJsonParse<{
    title?: string;
    integration_name?: string;
    metadata?: { redirect_url?: string };
    [key: string]: unknown;
  }>(toolResult?.payload?.content);

  const inputContent =
    payload?.display_content?.json_block || (!payload?.display_content && payload?.partial_json) || payload?.input_json;

  if (name === TOOL_NAMES.AUTHENTICATE_INTEGRATION_AND_CREATE_CONNECTION && toolResultData?.title) {
    const integrationItem = buildIntegrationItemFromToolResult(toolResultData) as IntegrationItem;
    return (
      <IntegrationCardV2
        className='my-6'
        integrationItem={integrationItem}
        redirectUrl={toolResultData?.metadata?.redirect_url}
      />
    );
  }

  return (
    <Accordion type='single' collapsible className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'>
      <AccordionItem value='tool-use' className='border-none'>
        <AccordionTrigger className='f-12-450 text-GRAY_900 w-full cursor-pointer gap-x-2 py-2 pr-2 pl-3 hover:bg-gray-50 [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90'>
          <div className='flex flex-1 items-center gap-3'>
            <div className='flex items-center gap-2'>
              {icon?.length ? (
                <ImageWithFallback src={icon} alt={toolName} className='h-4 w-4' />
              ) : (
                <AnimatedTerminalIcon showAnimation={!is_complete} size={12} />
              )}

              {!is_complete ? (
                <ShimmerText text={toolName} autoAnimate={true} />
              ) : (
                <span className='text-GRAY_900'>{toolName}</span>
              )}
            </div>
            {toolResult && toolResult.payload?.is_error && (
              <div className='ml-auto flex items-center gap-1.5'>
                <AlertCircle className='h-3.5 w-3.5 text-red-500' />
              </div>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className='bg-GRAY_50 max-h-60 space-y-4 overflow-y-auto px-2 py-2 [scrollbar-width:thin]'>
          <CodePreviewBlock label='Input' content={inputContent} />
          {toolResult && (
            <CodePreviewBlock
              label='Output'
              content={toolResult.payload?.content}
              isError={toolResult.payload?.is_error}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
