import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { AlertCircle, ChevronDown, Terminal } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';

import { snakeCaseToSentenceCase } from '@/utils/common';

import type { ToolResultContentBlock, ToolUseDisplayContent } from '../../types/block.types';
import { formatJson } from '../block.utils';

/**
 * Component to render a tool use content block with optional tool result using Accordion
 */
interface ToolCallBlockProps {
  payload: {
    display_content?: ToolUseDisplayContent;
    partial_json?: string;
    input_json?: string;
    name?: string;
    tool_call_id?: string;
    display_name?: string;
  };
  name?: string;
  is_complete: boolean;
  toolResult?: ToolResultContentBlock;
}
export const ToolCallBlock: FC<ToolCallBlockProps> = ({ payload, is_complete = true, name, toolResult }) => {
  const toolName = payload?.display_name || payload?.name || name || 'Unknown';
  const wasCompleteRef = useRef(is_complete);

  const [accordionValue, setAccordionValue] = useState<string>(is_complete ? '' : 'tool-use');

  useEffect(() => {
    // Auto-close accordion when is_complete transitions from false to true
    if (is_complete && !wasCompleteRef.current) {
      setAccordionValue('');
    }
    wasCompleteRef.current = is_complete;
  }, [is_complete]);

  return (
    <Accordion
      type='single'
      collapsible
      value={accordionValue}
      onValueChange={setAccordionValue}
      className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'
    >
      <AccordionItem value='tool-use' className='border-none'>
        <AccordionTrigger
          className='f-12-450 text-GRAY_900 w-full cursor-pointer gap-x-2 p-1.5 hover:no-underline [&[data-state=closed]>svg]:rotate-0 [&[data-state=open]>svg]:rotate-180'
          icon={ChevronDown}
          iconRotation={180}
        >
          <div className='flex flex-1 items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Terminal className='text-GRAY_700 h-4 w-4' strokeWidth={1.5} />
              <span className='text-GRAY_900'>{snakeCaseToSentenceCase(toolName)}</span>
            </div>
            {toolResult && toolResult.payload?.is_error && (
              <div className='ml-auto flex items-center gap-1.5'>
                <AlertCircle className='h-3.5 w-3.5 text-red-500' />
              </div>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className='border-GRAY_100 space-y-4 border-t px-3 pt-3 pb-3'>
          {payload?.display_content && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Input</span>
              <div className='border-GRAY_200 overflow-x-auto rounded-lg border bg-gray-50 p-3'>
                <pre className='f-12-400 text-GRAY_700 break-all whitespace-pre-wrap'>
                  {formatJson(payload?.display_content?.json_block)}
                </pre>
              </div>
            </div>
          )}
          {!payload?.display_content && payload?.partial_json && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Input</span>
              <div className='border-GRAY_200 overflow-x-auto rounded-lg border bg-gray-50 p-3'>
                <pre className='f-12-400 text-GRAY_700 break-all whitespace-pre-wrap'>
                  {formatJson(payload?.partial_json)}
                </pre>
              </div>
            </div>
          )}
          {payload?.input_json && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Input</span>
              <div className='border-GRAY_200 overflow-x-auto rounded-lg border bg-gray-50 p-3'>
                <pre className='f-12-400 text-GRAY_700 break-all whitespace-pre-wrap'>
                  {formatJson(payload?.input_json)}
                </pre>
              </div>
            </div>
          )}
          {toolResult && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Output</span>
              <div
                className={cn(
                  'overflow-x-auto rounded-lg border p-3',
                  toolResult.payload?.is_error ? 'border-red-200 bg-red-50' : 'border-GRAY_200 bg-gray-50',
                )}
              >
                <pre
                  className={cn(
                    'f-12-400 break-all whitespace-pre-wrap',
                    toolResult.payload?.is_error ? 'text-red-700' : 'text-GRAY_700',
                  )}
                >
                  {formatJson(toolResult.payload?.content)}
                </pre>
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
