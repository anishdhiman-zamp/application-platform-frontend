import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { CheckCircle, ChevronDown, Clock, Wrench } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FC } from 'react';

import type { ToolUseDisplayContent } from '../../types/block.types';

/**
 * Helper function to format JSON string with proper indentation
 */
const formatJson = (jsonString: string | undefined): string => {
  if (!jsonString) return '';
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // If parsing fails, return the original string
    return jsonString;
  }
};

/**
 * Component to render a tool use content block using Accordion
 */
interface ToolCallBlockProps {
  payload: {
    display_content?: ToolUseDisplayContent;
    partial_json?: string;
    input_json?: string;
    name?: string;
    tool_call_id?: string;
  };
  name?: string;
  is_complete: boolean;
}
export const ToolCallBlock: FC<ToolCallBlockProps> = ({ payload, is_complete = true, name }) => {
  const toolName = payload.name || name || 'Unknown';

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue='tool-use'
      className='border-GRAY_100 w-full overflow-hidden rounded-lg border bg-white'
    >
      <AccordionItem value='tool-use' className='border-none'>
        <AccordionTrigger
          className='f-12-450 text-GRAY_900 w-full gap-x-2 p-1.5 hover:no-underline [&[data-state=closed]>svg]:rotate-0 [&[data-state=open]>svg]:rotate-180'
          icon={ChevronDown}
          iconRotation={180}
        >
          <div className='flex flex-1 items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Wrench className='text-GRAY_700 h-4 w-4' />
              <span className='text-GRAY_900'>{toolName}</span>
            </div>
            <AnimatePresence mode='wait' initial={false}>
              {!is_complete ? (
                <span
                  key='running'
                  className='bg-GRAY_100 text-GRAY_900 f-12-450 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5'
                >
                  <Clock className='text-GRAY_700 h-3.5 w-3.5' />
                  Running
                </span>
              ) : (
                <motion.span
                  key='completed'
                  className='f-12-450 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                  >
                    <CheckCircle className='h-3.5 w-3.5 text-green-700' />
                  </motion.div>
                  Completed
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </AccordionTrigger>
        <AccordionContent className='border-GRAY_100 border-t px-3 pt-3 pb-3'>
          {payload.display_content && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Parameters</span>
              <div className='border-GRAY_200 overflow-x-auto rounded-lg border bg-gray-50 p-3'>
                <pre className='f-12-400 text-GRAY_700 break-all whitespace-pre-wrap'>
                  {formatJson(payload.display_content.json_block)}
                </pre>
              </div>
            </div>
          )}
          {!payload.display_content && payload.partial_json && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Parameters</span>
              <div className='border-GRAY_200 overflow-x-auto rounded-lg border bg-gray-50 p-3'>
                <pre className='f-12-400 text-GRAY_700 break-all whitespace-pre-wrap'>
                  {formatJson(payload.partial_json)}
                </pre>
              </div>
            </div>
          )}
          {payload.input_json && (
            <div className='space-y-2'>
              <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>Parameters</span>
              <div className='border-GRAY_200 overflow-x-auto rounded-lg border bg-gray-50 p-3'>
                <pre className='f-12-400 text-GRAY_700 break-all whitespace-pre-wrap'>
                  {formatJson(payload.input_json)}
                </pre>
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
