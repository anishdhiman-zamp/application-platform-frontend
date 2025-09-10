import { SvgSpriteLoader } from '@zamp-platform/ui/assets';

interface KnowledgeBasedTopbarProps {
  onClose?: () => void;
  title: string;
}

const KnowledgeBasedTopbar = ({ onClose, title }: KnowledgeBasedTopbarProps) => {
  return (
    <div className='flex w-full items-center justify-between border-b border-gray-400 px-5 py-3'>
      <div className='f-13-450 flex items-center gap-1.5'>
        <SvgSpriteLoader size={16} id='message-text-circle-02' className='text-gray-900' />
        {title}
      </div>
      <div className='f-12-500 flex cursor-pointer items-center gap-1.5' onClick={onClose}>
        End chat
        <SvgSpriteLoader size={16} id='x-close' className='text-gray-900' />
      </div>
    </div>
  );
};

export default KnowledgeBasedTopbar;
