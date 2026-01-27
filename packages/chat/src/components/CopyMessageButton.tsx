'use client';

import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, Copy } from 'lucide-react';
import { FC, useCallback, useState } from 'react';

import { Block, BLOCK_TYPE } from '../types/block.types';

export interface CopyMessageButtonProps {
  messageContent?: {
    text?: string;
    message?: string;
    elements?: Block[];
  };
  className?: string;
}

/**
 * Extracts plain text content from message blocks for clipboard copying
 */
const extractTextFromBlocks = (blocks: Block[] | undefined): string => {
  if (!blocks || blocks.length === 0) return '';

  return blocks
    .map((block) => {
      switch (block.type) {
        case BLOCK_TYPE.PLAIN_TEXT:
        case BLOCK_TYPE.MARKDOWN:
        case BLOCK_TYPE.TEXT:
          return block.payload?.text || '';
        case BLOCK_TYPE.QUESTION:
          return block.payload?.question || '';
        case BLOCK_TYPE.QUESTION_GROUP:
          return block.payload?.questions?.map((q) => q.payload?.question).join('\n') || '';
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n');
};

const CopyMessageButton: FC<CopyMessageButtonProps> = ({ messageContent, className }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyMessage = useCallback(async () => {
    const textContent =
      messageContent?.text || messageContent?.message || extractTextFromBlocks(messageContent?.elements);

    if (!textContent) return;

    try {
      await navigator.clipboard.writeText(textContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, [messageContent]);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='inline-flex'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleCopyMessage}
              className={cn(
                'hover:bg-GRAY_100 active:bg-GRAY_300 hover:text-GRAY_600 relative h-4 w-4 rounded-sm p-[2px]',
                className,
              )}
              aria-label='Copy message'
            >
              <span className='relative flex h-full w-full items-center justify-center'>
                <Copy
                  size={12}
                  className={cn(
                    'text-GRAY_500 absolute transition-transform duration-200 ease-in-out',
                    isCopied ? 'scale-50 opacity-0' : 'scale-100 opacity-100',
                  )}
                />
                <Check
                  size={12}
                  className={cn(
                    'text-GRAY_500 absolute transition-transform duration-200 ease-in-out',
                    isCopied ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
                  )}
                />
              </span>
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side='bottom' align='center' className='f-10-450 p-1.5' sideOffset={4}>
          <p>{isCopied ? 'Copied!' : 'Copy message'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyMessageButton;
