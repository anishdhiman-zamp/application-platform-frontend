'use client';

import { motion } from 'framer-motion';
import SidebarFooter from '@/modules/pace/components/layout/sidebar/SidebarFooter';
import SidebarHeader from '@/modules/pace/components/layout/sidebar/SidebarHeader';
import SidebarPrimaryActions from '@/modules/pace/components/layout/sidebar/SidebarPrimaryActions';
import { usePaceContext } from '@/modules/pace/pace.context';

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 48;

const Sidebar = () => {
  const { isNavSidebarExpanded, toggleNavSidebar } = usePaceContext();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isNavSidebarExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className='bg-BG_GRAY_2 flex h-full shrink-0 flex-col overflow-hidden'
    >
      <SidebarHeader isExpanded={isNavSidebarExpanded} onToggle={toggleNavSidebar} />

      <div className='mt-2'>
        <SidebarPrimaryActions isExpanded={isNavSidebarExpanded} />
      </div>

      <div className='flex-1' />

      <SidebarFooter isExpanded={isNavSidebarExpanded} />
    </motion.aside>
  );
};

export default Sidebar;
