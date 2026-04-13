import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedTerminalIcon,
  Button,
  ImageWithFallback,
  ScrollContainer,
  ShimmerText,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { safeJsonParse } from '@zamp-platform/utils';
import { AlertCircle, Play } from 'lucide-react';
import { useCallback, useState } from 'react';

import IntegrationCardV2 from '@/modules/integrations/AllIntegrations/IntegrationCardV2';
import type { IntegrationItem } from '@/types/api/integrations';

import { useChatActions } from '../../context/ChatActionsContext';
import type {
  ToolResultContentBlock,
  ToolUseDisplayContent,
  ToolUseDisplayContentParsed,
} from '../../types/block.types';
import { buildIntegrationItemFromToolResult } from '../block.utils';
import { TOOL_NAMES } from '../chat.constants';
import { CodePreviewBlock } from './CodePreviewBlock';

interface ToolCallBlockProps {
  payload: {
    display_content?: ToolUseDisplayContent;
    partial_json?: string;
    input_json?: string;
    tool_call_id?: string;
    name?: string;
    display_name?: string;
    display_title?: string;
    icon?: string;
  };
  is_complete: boolean;
  toolResult?: ToolResultContentBlock;
  isAccordionOpen?: boolean;
  onAccordionOpenChange?: (isOpen: boolean) => void;
  showConnectorFromPrevious?: boolean;
  showConnectorToNext?: boolean;
  conversationId?: string;
  showWatchButton?: boolean;
  embedded?: boolean;
  /** Flat transparent shell (e.g. nested in a muted panel); keeps icons/connectors unlike `embedded`. */
  quietSurface?: boolean;
  /** First block in a consecutive thinking/tool-call group — adds top padding. */
  isFirstInGroup?: boolean;
  /** Last block in a consecutive thinking/tool-call group — adds bottom padding. */
  isLastInGroup?: boolean;
  /** Remove bottom padding — use on the last ToolCallBlock in a message. */
  isLastToolCallOrder?: boolean;
  isStreaming?: boolean;
}
export const ToolCallBlock = ({
  payload,
  is_complete = true,
  toolResult,
  isAccordionOpen,
  onAccordionOpenChange,
  showConnectorFromPrevious = false,
  showConnectorToNext = false,
  embedded = false,
  quietSurface = false,
  showWatchButton = false,
  isFirstInGroup = false,
  isLastInGroup = false,
  isLastToolCallOrder = false,
  isStreaming = false,
}: ToolCallBlockProps) => {
  const flatShell = embedded || quietSurface;
  const [internalAccordionOpen, setInternalAccordionOpen] = useState<boolean>(false);
  const isControlled = typeof isAccordionOpen === 'boolean';
  const resolvedIsAccordionOpen = isControlled ? isAccordionOpen : internalAccordionOpen;
  const displayContent = safeJsonParse<ToolUseDisplayContentParsed>(payload?.display_content?.json_block);

  // Check partial_json too so display_title resolves before TOOL_USE_BLOCK_UPDATE_DELTA arrives.
  const parsedInput = safeJsonParse<Record<string, unknown>>(payload?.input_json);
  const parsedPartial = safeJsonParse<Record<string, unknown>>(payload?.partial_json);

  const toolName =
    payload?.display_title ||
    displayContent?.display_title ||
    (typeof parsedInput?.display_title === 'string' ? parsedInput.display_title : undefined) ||
    (typeof parsedPartial?.display_title === 'string' ? parsedPartial.display_title : undefined) ||
    payload?.display_name ||
    'Unknown';
  const name = payload?.name || displayContent?.tool_name;
  const icon = payload?.icon || displayContent?.icon;

  const { onWatchStream, isBrowserStreamingAvailable } = useChatActions();

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
      onWatchStream?.();
    },
    [onWatchStream],
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
      className={cn(
        'w-full overflow-hidden',
        flatShell ? 'rounded-none border-none bg-transparent shadow-none' : 'bg-BG_WHITE',
        isLastInGroup && !flatShell && 'mb-1',
        isFirstInGroup && !flatShell && 'mt-1',
        isLastToolCallOrder && !isStreaming && 'mb-0',
      )}
    >
      <AccordionItem value='tool-use' className='relative border-none'>
        {showConnectorFromPrevious && (
          <div className='bg-border pointer-events-none absolute top-0 left-[6.5px] z-0 h-2 w-px' />
        )}
        <AccordionTrigger
          className={cn(
            'font-420 w-full cursor-pointer gap-x-2 text-[13px] [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90',
            embedded ? 'py-1.5' : 'py-2',
            flatShell ? 'text-GRAY_1000' : 'text-GRAY_700',
          )}
        >
          <div className='flex flex-1 items-center gap-3'>
            <div className='flex items-center gap-x-2'>
              {!embedded && (
                <div className={cn('flex h-3.5 w-3.5 items-center justify-center', flatShell ? 'bg-BG_WHITE' : '')}>
                  {icon?.length ? (
                    <ImageWithFallback src={icon} alt={toolName} className='h-3 w-3' />
                  ) : (
                    <AnimatedTerminalIcon showAnimation={!is_complete} size={14} />
                  )}
                </div>
              )}

              {!is_complete ? (
                <ShimmerText text={toolName} autoAnimate={true} />
              ) : (
                <span
                  className={cn(
                    'font-420 text-[13px]',
                    flatShell ? (resolvedIsAccordionOpen ? 'text-GRAY_1000' : 'text-GRAY_950') : 'text-GRAY_700',
                  )}
                >
                  {toolName}
                </span>
              )}
            </div>

            {showWatchButton && onWatchStream && isBrowserStreamingAvailable && (
              <Button
                variant='ghost'
                size='xsmall'
                onClick={handleWatchToggle}
                className='ml-auto gap-1 rounded-full'
                leadingIcon={<Play size={10} className='fill-current' />}
              >
                Watch
              </Button>
            )}

            {toolResult && toolResult.payload?.is_error && !showWatchButton && (
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
          <ScrollContainer
            className='max-h-60'
            scrollbarStyle='none'
            scrollClassName={cn('space-y-4 pr-2', embedded ? 'pl-3' : 'pl-6')}
          >
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
