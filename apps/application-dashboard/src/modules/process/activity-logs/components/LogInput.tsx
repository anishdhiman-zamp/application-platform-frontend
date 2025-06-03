import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Textarea, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { MAX_TEXTAREA_HEIGHT } from 'modules/process/process.constant';
import { useEmitActivityLogsMutation } from '@/apis/processes';
import { COLORS } from '@/constants/colors';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppSelector } from '@/hooks/toolkit';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { PROCESS_ACCESS_PRIVILEGES, ResourceType } from '@/modules/shareResource/shareResource.types';

interface LogInputProps {
  processId: string;
  activityId: string;
}

const LogInput: FC<LogInputProps> = ({ processId, activityId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputValue, setInputValue] = useState('');

  const { user } = useAppSelector((state) => state.user);
  const { audiencesData, loading: isLoadingAudienceMembers } = useAudienceMembers({
    resourceType: ResourceType.PROCESS,
    resourceId: processId,
  });

  const enableSendMessage = useMemo(() => {
    const userPrivilege = audiencesData?.find((audience) => audience.user?.user_id === user?.user_id)?.privilege;

    const organisationPrivilege = audiencesData?.find((audience) => audience.resource_audience_type === 'organization');

    const hasEditorPrivileges = (privilege: PROCESS_ACCESS_PRIVILEGES) =>
      privilege === PROCESS_ACCESS_PRIVILEGES.ADMIN || privilege === PROCESS_ACCESS_PRIVILEGES.EDITOR;

    return (
      hasEditorPrivileges(userPrivilege as PROCESS_ACCESS_PRIVILEGES) ??
      (organisationPrivilege && hasEditorPrivileges(organisationPrivilege.privilege as PROCESS_ACCESS_PRIVILEGES))
    );
  }, [audiencesData, user]);

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
          toast.error(error.data.message ?? 'Something went wrong');
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
          disabled={isLoading || isLoadingAudienceMembers || !enableSendMessage}
        />
        <div className='flex justify-end p-2'>
          <Button
            size='icon'
            variant='ghost'
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading || isLoadingAudienceMembers || !enableSendMessage}
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
