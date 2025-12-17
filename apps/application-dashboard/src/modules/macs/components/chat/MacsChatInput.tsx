'use client';

import { useRef, useState } from 'react';
import { Button, Textarea } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowUp, Mic, Paperclip } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

interface MacsChatInputProps {
  className?: string;
  onSubmit?: (message: string) => void;
  disabled?: boolean;
}

const MAX_TEXTAREA_HEIGHT = 200;

const MacsChatInput = ({ className, onSubmit, disabled }: MacsChatInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    resizeTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim() || disabled) return;
    onSubmit?.(inputValue);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleMicClick = () => {
    // TODO: Implement mic functionality
    console.log('Mic clicked');
  };

  const handleAttachmentClick = () => {
    // TODO: Implement attachment functionality
    console.log('Attachment clicked');
  };

  return (
    <div onClick={() => textareaRef.current?.focus()} className={cn('w-full px-4', className)}>
      <div className='overflow-hidden rounded-xl border border-gray-400 bg-white shadow-xs'>
        <div className='relative flex-grow'>
          {inputValue.length === 0 && (
            <div className='f-16-450 pointer-events-none absolute top-3 left-4 z-10 flex items-center gap-1 text-gray-600 select-none'>
              Do your life&apos;s best work with Pace
            </div>
          )}
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder=''
            aria-label='Message input'
            className='f-16-450 w-full resize-none overflow-y-auto rounded-none border-none px-4 pt-3 pb-0 shadow-none focus-visible:ring-0'
            rows={1}
            disabled={disabled}
          />
        </div>
        <div className='flex items-center justify-between p-2'>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-gray-500 hover:text-gray-900'
              onClick={handleMicClick}
              type='button'
            >
              <Mic size={18} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-gray-500 hover:text-gray-900'
              onClick={handleAttachmentClick}
              type='button'
            >
              <Paperclip size={18} />
            </Button>
          </div>
          <Button
            size='icon'
            onClick={handleSubmit}
            disabled={!inputValue.trim() || disabled}
            aria-label='Send message'
            className='h-7 w-7'
          >
            <ArrowUp size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MacsChatInput;
