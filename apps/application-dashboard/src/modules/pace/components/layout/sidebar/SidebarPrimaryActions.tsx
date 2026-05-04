'use client';

import { Bot, CheckSquare, CirclePlus, LayoutGrid, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import SidebarRow from '@/modules/pace/components/layout/sidebar/SidebarRow';
import { PACE_SETTINGS_TABS } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_QUERY_PARAM } from '@/modules/pace/pace.types';
import { dynamicTabsActions } from '@/store/slices/dynamic-tabs.slice';
import { getFromSessionStorage, SESSION_STORAGE_KEYS } from '@/utils/sessionstorage';

interface SidebarPrimaryActionsProps {
  isExpanded: boolean;
}

const NAV_ITEMS = [
  { label: 'Tasks', icon: <CheckSquare size={16} />, path: ROUTES_PATH.CHAT_TASK },
  { label: 'Agents', icon: <Bot size={16} />, path: ROUTES_PATH.CHAT_AGENTS },
  { label: 'Apps', icon: <LayoutGrid size={16} />, path: ROUTES_PATH.CHAT_APPS },
  { label: 'Settings', icon: <Settings size={16} />, path: ROUTES_PATH.CHAT_SETTINGS },
];

const VALID_SETTINGS_PATHS = new Set(PACE_SETTINGS_TABS.map((tab) => tab.path));

const resolveSettingsTarget = (): string => {
  const lastTab = getFromSessionStorage(SESSION_STORAGE_KEYS.PACE_SETTINGS_LAST_TAB);

  return lastTab && VALID_SETTINGS_PATHS.has(lastTab) ? lastTab : ROUTES_PATH.CHAT_SETTINGS_GENERAL;
};

const SidebarPrimaryActions = ({ isExpanded }: SidebarPrimaryActionsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { startNewChat, setChatSidebarState, triggerLogoAnimation } = usePaceContext();

  const cleanupTabState = () => {
    const params = new URLSearchParams(window.location.search);

    Object.values(TAB_QUERY_PARAM).forEach((key) => params.delete(key));
    const search = params.toString();

    window.history.replaceState(null, '', search ? `${window.location.pathname}?${search}` : window.location.pathname);

    dispatch(dynamicTabsActions.setActiveTab(null));
  };

  const handleNavItemClick = (path: string) => {
    cleanupTabState();

    if (path === ROUTES_PATH.CHAT_SETTINGS) {
      router.push(resolveSettingsTarget());

      return;
    }

    router.push(path);
  };

  const handleNewChat = () => {
    triggerLogoAnimation();
    startNewChat();
    setChatSidebarState(CHAT_SIDEBAR_STATE.COLLAPSED);
    cleanupTabState();
    router.push(ROUTES_PATH.CHAT);
  };

  return (
    <div className='flex shrink-0 flex-col gap-y-0.5 px-3 pt-4'>
      <SidebarRow icon={<CirclePlus size={16} />} label='New chat' isExpanded={isExpanded} onClick={handleNewChat} />
      {NAV_ITEMS.map((item) => (
        <SidebarRow
          key={item.path}
          icon={item.icon}
          label={item.label}
          isExpanded={isExpanded}
          isActive={pathname?.startsWith(item.path) ?? false}
          onClick={() => handleNavItemClick(item.path)}
        />
      ))}
    </div>
  );
};

export default SidebarPrimaryActions;
