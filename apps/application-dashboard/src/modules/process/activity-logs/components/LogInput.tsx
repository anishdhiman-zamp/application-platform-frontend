import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Textarea, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MAX_TEXTAREA_HEIGHT } from 'modules/process/process.constant';
import { useEmitActivityLogsMutation } from '@/apis/processes';
import { COLORS } from '@/constants/colors';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppSelector } from '@/hooks/toolkit';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import { PROCESS_ACCESS_PRIVILEGES, ResourceType } from '@/modules/shareResource/shareResource.types';

interface LogInputProps {
  processId: string;
  activityId: string;
}

const LogInput: FC<LogInputProps> = ({ processId, activityId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputValue, setInputValue] = useState('');

  const { user } = useAppSelector((state) => state.user);
  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.PROCESS,
    resourceId: processId,
    skipAudienceData: false,
  });

  const currentUserHasEditAccess = useMemo(() => {
    return checkUserPrivilege(PROCESS_ACCESS_PRIVILEGES.EDITOR) || checkUserPrivilege(PROCESS_ACCESS_PRIVILEGES.ADMIN);
  }, [checkUserPrivilege]);

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

    const payload = {
      feedback_message: trimmedMessage,
      sender_id: user?.user_id ?? '',
    };

    if (trimmedMessage && /\S/.test(trimmedMessage)) {
      emitActivityLogs({
        processId,
        activityRunId: activityId,
        payload: payload,
      })
        .unwrap()
        .then(() => {
          setInputValue('');
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        })
        .catch((error) => {
          toast.error(error?.data?.message ?? 'Something went wrong');
        });
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, []);

  return (
    <div className='w-full px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <div className='border-GRAY_400 overflow-hidden rounded-xl border bg-white pt-2 shadow-xs'>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder='Work with Pace'
          aria-label='Message input'
          className='f-13-450 w-full resize-none overflow-y-auto rounded-none border-none px-4 shadow-none'
          rows={1}
          disabled={isLoading || !currentUserHasEditAccess}
        />
        <div className='flex justify-end p-2'>
          <Button
            size='icon'
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading || !currentUserHasEditAccess}
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

export default LogInput;
