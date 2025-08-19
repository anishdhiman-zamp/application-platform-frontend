import { type FC, useEffect, useRef } from 'react';
import { Button, Textarea } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MAX_TEXTAREA_HEIGHT } from 'modules/process/process.constant';
import { COLORS } from '@/constants/colors';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import PaceIcon from '@/modules/knowledge-based/icons/PaceIcon';
import type { defaultFnType } from '@/types/commonTypes';
import { cn } from '@/utils/common';

interface KbChatInputProps {
  className?: string;
  placeholder?: string;
  onSubmit: (inputValue: string) => void;
  inputValue: string;
  setInputValue: (inputValue: string) => void;
  disabled?: boolean;
  textWrapperClassName?: string;
  textAreaClassName?: string;
  sendButtonClassName?: string;
  placeholderClassName?: string;
  messageCount?: number;
  onFocus?: defaultFnType;
  onBlur?: defaultFnType;
}

const KbChatInput: FC<KbChatInputProps> = ({
  className,
  placeholder,
  onSubmit,
  inputValue,
  setInputValue,
  disabled,
  textWrapperClassName = '',
  textAreaClassName = '',
  sendButtonClassName = '',
  placeholderClassName = '',
  messageCount,
  onFocus,
  onBlur,
}) => {
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

  const handleSubmit = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    onSubmit(inputValue);
  };

  useEffect(() => {
    resizeTextarea();
  }, []);

  useEffect(() => {
    if (messageCount && messageCount > 0) {
      textareaRef.current?.focus();
    }
  }, [messageCount]);

  return (
    <div
      onClick={() => {
        textareaRef.current?.focus();
      }}
      className={cn('w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}
    >
      <div
        className={cn(
          'border-GRAY_400 overflow-hidden rounded-xl border bg-white pt-2 shadow-xs',
          textWrapperClassName,
        )}
      >
        <div className='relative flex-grow'>
          {inputValue.length === 0 && (
            <div
              className={cn(
                'f-16-450 pointer-events-none absolute top-2 left-4 z-10 text-gray-700 select-none',
                placeholderClassName,
              )}
            >
              {placeholder || (
                <div className='flex items-center gap-1'>
                  Ask follow up questions to
                  <PaceIcon height={12} width={12} />
                  Pace
                </div>
              )}
            </div>
          )}
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder=''
            aria-label='Message input'
            className={cn(
              'f-16-450 !text-16 w-full resize-none overflow-y-auto rounded-none border-none px-4 shadow-none',
              textAreaClassName,
            )}
            rows={1}
            disabled={disabled}
          />
        </div>
        <div className={cn('flex items-end justify-end p-2', sendButtonClassName)}>
          <Button
            size='icon'
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            aria-label='Send message'
            className='!size-6'
          >
            <SvgSpriteLoader id='arrow-up' size={14} color={COLORS.WHITE} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KbChatInput;
