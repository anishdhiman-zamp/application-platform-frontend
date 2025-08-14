import { type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { SenderType } from '@zamp-platform/chat';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

interface ChatCardProps {
  message: string;
  senderType: SenderType;
}

const ChatCard: FC<ChatCardProps> = ({ message, senderType }) => {
  switch (senderType) {
    case SenderType.USER: {
      return (
        <div className='flex justify-end'>
          <span className='f-13-450 bg-GRAY_1000 rounded-[8px] rounded-br-none p-3.5 text-white'>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
              {message}
            </ReactMarkdown>
          </span>
        </div>
      );
    }
    case SenderType.ASSISTANT:
      return (
        <div className='kb-viewer animate-opacity'>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {message}
          </ReactMarkdown>
        </div>
      );
    default:
      return (
        <div className='kb-viewer animate-opacity'>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className='f-13-450'>{children}</p>,
            }}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
          >
            {message}
          </ReactMarkdown>
        </div>
      );
  }
};

export default ChatCard;
