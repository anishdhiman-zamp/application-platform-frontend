'use client';

import { Bot, CheckSquare, CirclePlus, FolderOpen, LayoutGrid } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import SidebarRow from '@/modules/pace/components/layout/sidebar/SidebarRow';
import { usePaceActionsContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_QUERY_PARAM } from '@/modules/pace/pace.types';
import { dynamicTabsActions } from '@/store/slices/dynamic-tabs.slice';

interface SidebarPrimaryActionsProps {
  isExpanded: boolean;
}

const NAV_ITEMS = [
  { label: 'Tasks', icon: <CheckSquare size={16} />, path: ROUTES_PATH.CHAT_TASK },
  { label: 'Files', icon: <FolderOpen size={16} />, path: ROUTES_PATH.CHAT_FILES },
  { label: 'Agents', icon: <Bot size={16} />, path: ROUTES_PATH.CHAT_AGENTS },
  { label: 'Apps', icon: <LayoutGrid size={16} />, path: ROUTES_PATH.CHAT_APPS },
];

const SidebarPrimaryActions = ({ isExpanded }: SidebarPrimaryActionsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { setChatSidebarState } = usePaceLayoutContext();
  const { startNewChat, triggerLogoAnimation } = usePaceActionsContext();

  const cleanupTabState = ({ clearActiveTab = false }: { clearActiveTab?: boolean } = {}) => {
    const params = new URLSearchParams(window.location.search);

    Object.values(TAB_QUERY_PARAM).forEach((key) => params.delete(key));
    const search = params.toString();

    window.history.replaceState(null, '', search ? `${window.location.pathname}?${search}` : window.location.pathname);

    if (clearActiveTab) {
      dispatch(dynamicTabsActions.setActiveTab(null));
    }
  };

  const handleNavItemClick = (path: string) => {
    router.push(path);
  };

  const handleNavItemHover = (path: string) => {
    router.prefetch(path);
  };

  const handleNewChat = () => {
    triggerLogoAnimation();
    startNewChat();
    setChatSidebarState(CHAT_SIDEBAR_STATE.COLLAPSED);
    cleanupTabState({ clearActiveTab: true });
    router.push(ROUTES_PATH.CHAT);
  };

  return (
    <div className='flex shrink-0 flex-col px-3 pt-3'>
      <SidebarRow icon={<CirclePlus size={16} />} label='New chat' isExpanded={isExpanded} onClick={handleNewChat} />
      {NAV_ITEMS.map((item) => (
        <SidebarRow
          key={item.path}
          icon={item.icon}
          label={item.label}
          isExpanded={isExpanded}
          isActive={pathname?.startsWith(item.path) ?? false}
          onClick={() => handleNavItemClick(item.path)}
          onMouseEnter={() => handleNavItemHover(item.path)}
          onFocus={() => handleNavItemHover(item.path)}
        />
      ))}
    </div>
  );
};

export default SidebarPrimaryActions;
