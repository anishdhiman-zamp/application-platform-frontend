import { FC, memo } from 'react';
import { ChatMessage, SenderType } from '@zamp-platform/chat';
import PaceAvatar from 'modules/chatbot/PaceAvatar';
import Avatar from '@/components/common/avatar';
import { COLORS } from '@/constants/colors';

interface SenderDetailsProps {
  message: ChatMessage;
}

const SenderDetails: FC<SenderDetailsProps> = ({ message }) => {
  const isAssistant = message.sender_type === SenderType.ASSISTANT;
  const senderName = isAssistant ? 'Pace' : (message.sender_name ?? '');

  return (
    <div className='flex items-center gap-1.5'>
      {isAssistant ? (
        <PaceAvatar />
      ) : (
        <Avatar
          name={senderName}
          backgroundColor={COLORS.YELLOW_300}
          className='f-10-500 text-gray-1000 flex h-4 min-h-4 w-4 min-w-4 items-center justify-center rounded-md'
        />
      )}
      <span className='f-12-550'>{senderName}</span>
    </div>
  );
};

export default memo(SenderDetails);
