import { cn } from '@zamp-platform/ui/utils';
import { useAppSelector } from '@/hooks/toolkit';
import KnowledgeBasedChat from '@/modules/knowledge-based/KnowledgeBasedChat';
import type { defaultFnType } from '@/types/commonTypes';

interface ExploreKBPropsType {
  isExpanded: boolean;
  onClose: defaultFnType;
  userMessage: string;
  title: string;
}

const KnowledgeBaseChatWrapper = ({ isExpanded, onClose, userMessage, title }: ExploreKBPropsType) => {
  const { isSidebarOpen } = useAppSelector((state) => state.layoutConfig);

  return (
    <div
      className={cn(
        `rounded-tl-3 fixed top-[48px] right-0 z-50 mt-[49px] flex h-[calc(100vh-48px)] flex-col items-center justify-center bg-white transition-all duration-400`,
        isExpanded ? 'top-0 opacity-100' : 'pointer-events-none top-full opacity-0',
        isSidebarOpen ? 'w-[calc(100vw-241px)]' : 'w-full',
      )}
    >
      <KnowledgeBasedChat onClose={onClose} userMessage={userMessage} title={title} />
    </div>
  );
};

export default KnowledgeBaseChatWrapper;
