'use client';

import { Bot, CheckSquare, CirclePlus, FolderOpen, LayoutGrid } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { routeForTab } from '@/components/layouts/app-sidebar/utils/tab-routing';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import SidebarRow from '@/modules/pace/components/layout/sidebar/SidebarRow';
import { usePaceActionsContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_QUERY_PARAM } from '@/modules/pace/pace.types';
import { dynamicTabsActions } from '@/store/slices/dynamic-tabs.slice';
import { selectTabRecord } from '@/store/slices/workspace-tabs.slice';
import type { TabIdType } from '@/types/workspace-tabs.types';

interface SidebarPrimaryActionsProps {
  isExpanded: boolean;
}

const NAV_ITEMS = [
  { tabId: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} />, path: ROUTES_PATH.CHAT_TASK },
  { tabId: 'files', label: 'Files', icon: <FolderOpen size={16} />, path: ROUTES_PATH.CHAT_FILES },
  { tabId: 'agents', label: 'Agents', icon: <Bot size={16} />, path: ROUTES_PATH.CHAT_AGENTS },
  { tabId: 'apps', label: 'Apps', icon: <LayoutGrid size={16} />, path: ROUTES_PATH.CHAT_APPS },
];

const SidebarPrimaryActions = ({ isExpanded }: SidebarPrimaryActionsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { setChatSidebarState } = usePaceLayoutContext();
  const { startNewChat, requestChatInputFocus, triggerLogoAnimation } = usePaceActionsContext();
  const tasksRecord = useAppSelector(selectTabRecord('tasks'));
  const filesRecord = useAppSelector(selectTabRecord('files'));
  const agentsRecord = useAppSelector(selectTabRecord('agents'));
  const appsRecord = useAppSelector(selectTabRecord('apps'));
  const lastSubRoutes: Partial<Record<TabIdType, string>> = {
    tasks: tasksRecord?.lastSubRoute,
    files: filesRecord?.lastSubRoute,
    agents: agentsRecord?.lastSubRoute,
    apps: appsRecord?.lastSubRoute,
  };

  const cleanupTabState = ({ clearActiveTab = false }: { clearActiveTab?: boolean } = {}) => {
    const params = new URLSearchParams(window.location.search);

    Object.values(TAB_QUERY_PARAM).forEach((key) => params.delete(key));
    const search = params.toString();

    window.history.replaceState(null, '', search ? `${window.location.pathname}?${search}` : window.location.pathname);

    if (clearActiveTab) {
      dispatch(dynamicTabsActions.setActiveTab(null));
    }
  };

  const getNavItemPath = (tabId: TabIdType) => {
    return routeForTab(tabId, lastSubRoutes[tabId]);
  };

  const handleNavItemClick = (tabId: TabIdType) => {
    router.push(getNavItemPath(tabId));
  };

  const handleNavItemHover = (tabId: TabIdType) => {
    router.prefetch(getNavItemPath(tabId));
  };

  const handleNewChat = () => {
    triggerLogoAnimation();
    startNewChat();
    setChatSidebarState(CHAT_SIDEBAR_STATE.COLLAPSED);
    cleanupTabState({ clearActiveTab: true });
    router.push(ROUTES_PATH.CHAT);
    requestChatInputFocus();
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
          onClick={() => handleNavItemClick(item.tabId)}
          onMouseEnter={() => handleNavItemHover(item.tabId)}
          onFocus={() => handleNavItemHover(item.tabId)}
        />
      ))}
    </div>
  );
};

export default SidebarPrimaryActions;
