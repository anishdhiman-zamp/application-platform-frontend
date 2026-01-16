import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, AnimatedTerminalIcon } from '@zamp-platform/ui';
import { AlertCircle, ChevronDown } from 'lucide-react';
import React, { FC } from 'react';

import type { ToolResultContentBlock, ToolUseDisplayContent } from '../../types/block.types';
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
    display_name?: string;
  };
  is_complete: boolean;
  toolResult?: ToolResultContentBlock;
}
export const ToolCallBlock: FC<ToolCallBlockProps> = ({ payload, is_complete = true, toolResult }) => {
  const toolName = payload?.display_name || 'Unknown';
  // const wasCompleteRef = useRef(is_complete);

  // const [accordionValue, setAccordionValue] = useState<string>(is_complete ? '' : 'tool-use');

  // useEffect(() => {
  //   // Auto-close accordion when is_complete transitions from false to true
  //   if (is_complete && !wasCompleteRef.current) {
  //     setAccordionValue('');
  //   }
  //   wasCompleteRef.current = is_complete;
  // }, [is_complete]);

  const inputContent =
    payload?.display_content?.json_block || (!payload?.display_content && payload?.partial_json) || payload?.input_json;

  return (
    <Accordion
      type='single'
      collapsible
      // value={accordionValue}
      // onValueChange={setAccordionValue}
      className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'
    >
      <AccordionItem value='tool-use' className='border-none'>
        <AccordionTrigger
          className='f-12-450 text-GRAY_900 w-full cursor-pointer gap-x-2 py-2 pr-2 pl-3 hover:bg-gray-50 [&[data-state=closed]>svg]:rotate-90 [&[data-state=open]>svg]:-rotate-90'
          icon={ChevronDown}
          iconRotation={180}
        >
          <div className='flex flex-1 items-center gap-3'>
            <div className='flex items-center gap-2'>
              <AnimatedTerminalIcon showAnimation={!is_complete} size={12} />
              <span className='text-GRAY_900'>{toolName}</span>
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
