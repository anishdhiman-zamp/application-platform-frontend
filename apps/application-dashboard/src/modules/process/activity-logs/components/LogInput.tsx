import { type FC, useEffect, useRef, useState } from 'react';
import { captureException } from '@sentry/nextjs';
import { Button, Textarea } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MAX_TEXTAREA_HEIGHT } from 'modules/process/process.constant';
import { CONTENT_TYPE, LOG_STATUS, SENDER_TYPE } from 'modules/process/process.types';
import { useEmitActivityLogsMutation } from '@/apis/processes';
import { COLORS } from '@/constants/colors';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppSelector } from '@/hooks/toolkit';

interface LogInputProps {
  processId: string;
  activityId: string;
}

const LogInput: FC<LogInputProps> = ({ processId, activityId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputValue, setInputValue] = useState('');

  const { user } = useAppSelector((state) => state.user);

  const [emitActivityLogs, { isLoading }] = useEmitActivityLogsMutation();

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
    const trimmedMessage = inputValue.trim();

    if (trimmedMessage && /\S/.test(trimmedMessage)) {
      emitActivityLogs({
        processId,
        activityRunId: activityId,
        payload: {
          content: {
            message: trimmedMessage,
            sender_type: SENDER_TYPE.USER,
            sender_id: user?.user_id ?? '',
            thought_steps: [],
            ctas: [],
          },
          log_group_id: '',
          content_type: CONTENT_TYPE.MESSAGE_SECTION,
          status: LOG_STATUS.SUCCESS,
        },
      })
        .unwrap()
        .then(() => {
          setInputValue('');
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        })
        .catch(() => {
          captureException(new Error('Failed to emit activity logs'));
        });
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, []);

  return (
    <div className='w-full px-4 pb-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
      <div className='border border-GRAY_400 rounded-xl overflow-hidden shadow-sm bg-white pt-2'>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder='Work with Pace'
          aria-label='Message input'
          className='w-full px-4 resize-none overflow-y-auto f-13-450 border-none shadow-none rounded-none'
          rows={1}
          disabled={isLoading}
        />
        <div className='flex justify-end p-2'>
          <Button
            size='icon'
            variant='ghost'
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            aria-label='Send message'
            className='bg-GRAY_100 !size-6 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <SvgSpriteLoader id='arrow-up' size={14} color={COLORS.GRAY_700} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogInput;
