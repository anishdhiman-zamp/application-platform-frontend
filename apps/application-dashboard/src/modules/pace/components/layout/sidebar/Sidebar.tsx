'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import SidebarFooter from '@/modules/pace/components/layout/sidebar/SidebarFooter';
import SidebarHeader from '@/modules/pace/components/layout/sidebar/SidebarHeader';
import SidebarPrimaryActions from '@/modules/pace/components/layout/sidebar/SidebarPrimaryActions';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { SIDEBAR_TOGGLE_TRANSITION } from '@/utils/animations/sidebar.animations';

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 48;

const Sidebar = () => {
  const { isNavSidebarExpanded, toggleNavSidebar, selectConversation, activeConversationId } = usePaceContext();
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const widthTransition = shouldReduceMotion ? { duration: 0 } : SIDEBAR_TOGGLE_TRANSITION;

  const handleSelectConversation = (id: string | null, title?: string) => {
    if (!id) return;
    if (pathname && pathname !== '/chat') {
      router.push(`/chat?${SIDEBAR_CONVERSATION_ID_PARAM}=${id}`);

      return;
    }
    selectConversation(id, title);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isNavSidebarExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
      transition={widthTransition}
      className='bg-BG_GRAY_2 flex h-full shrink-0 flex-col overflow-hidden'
    >
      <SidebarHeader isExpanded={isNavSidebarExpanded} onToggle={toggleNavSidebar} />

      <div className='mt-2'>
        <SidebarPrimaryActions isExpanded={isNavSidebarExpanded} />
      </div>

      {isNavSidebarExpanded ? (
        <ChatHistory
          onSelectConversation={handleSelectConversation}
          activeConversationId={activeConversationId}
          recentLimit={5}
          viewMoreHref='/chat/history'
        />
      ) : (
        <div className='flex-1' />
      )}

      <SidebarFooter isExpanded={isNavSidebarExpanded} />
    </motion.aside>
  );
};

export default Sidebar;
