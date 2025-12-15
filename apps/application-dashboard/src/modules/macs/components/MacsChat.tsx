'use client';

import { cn } from '@zamp-platform/ui/utils';
import ChatTopbar from '@/modules/macs/components/ChatTopbar';
import MacsChatHome from '@/modules/macs/components/MacsChatHome';
import MacsChatInput from '@/modules/macs/components/MacsChatInput';

interface MacsChatProps {
  className?: string;
  showTopbar?: boolean;
}

const MacsChat = ({ className, showTopbar = false }: MacsChatProps) => {
  const handleSubmit = (message: string) => {
    // TODO: Implement message sending
    console.log('Message submitted:', message);
  };

  return (
    <div className={cn('mx-auto flex h-full w-full flex-col bg-white', className)}>
      {/* Chat topbar - only shown in default state (inside chat area) */}
      {showTopbar && <ChatTopbar />}

      {/* Chat content area */}
      <div className='mt-[116px] flex h-full flex-col items-center gap-y-4 overflow-y-auto'>
        <MacsChatHome />
        <MacsChatInput onSubmit={handleSubmit} className='mx-auto max-w-[600px] p-3' />
      </div>
    </div>
  );
};

export default MacsChat;
