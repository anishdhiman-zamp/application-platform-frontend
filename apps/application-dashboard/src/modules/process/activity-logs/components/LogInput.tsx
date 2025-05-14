import { useEffect, useRef, useState } from 'react';
import { Button, Textarea } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MAX_TEXTAREA_HEIGHT } from 'modules/process/process.constant';
import { COLORS } from '@/constants/colors';

const LogInput = () => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputValue, setInputValue] = useState('');

  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    resizeTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmedMessage = inputValue.trim();

    if (trimmedMessage && /\S/.test(trimmedMessage)) {
      // TODO: handle message submission
      // will remove this console.log after api integration
      console.log('Submitted:', trimmedMessage);

      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className='absolute bottom-0 w-full px-4 pb-4 z-10'>
      <div className='border border-GRAY_400 rounded-xl overflow-hidden shadow-sm bg-white pt-2'>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder='Work with Adam'
          aria-label='Message input'
          className='w-full px-4 resize-none overflow-y-auto f-13-450 border-none shadow-none rounded-none'
          rows={1}
        />
        <div className='flex justify-end p-2'>
          <Button
            size='icon'
            variant='ghost'
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            aria-label='Send message'
            className='bg-GRAY_100 !size-6 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <SvgSpriteLoader id='arrow-up' height={14} width={14} color={COLORS.GRAY_700} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogInput;
