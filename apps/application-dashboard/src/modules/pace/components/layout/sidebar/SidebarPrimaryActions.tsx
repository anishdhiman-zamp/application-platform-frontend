'use client';

import { Bot, CheckSquare, LayoutGrid, Plus, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch } from '@/hooks/toolkit';
import SidebarRow from '@/modules/pace/components/layout/sidebar/SidebarRow';
import { usePaceContext } from '@/modules/pace/pace.context';
import { TAB_QUERY_PARAM } from '@/modules/pace/pace.types';
import { dynamicTabsActions } from '@/store/slices/dynamic-tabs.slice';

interface SidebarPrimaryActionsProps {
  isExpanded: boolean;
}

const NAV_ITEMS = [
  { label: 'Tasks', icon: <CheckSquare size={16} />, path: ROUTES_PATH.CHAT_TASK },
  { label: 'Agents', icon: <Bot size={16} />, path: ROUTES_PATH.CHAT_AGENTS },
  { label: 'Apps', icon: <LayoutGrid size={16} />, path: ROUTES_PATH.CHAT_APPS },
  { label: 'Settings', icon: <Settings size={16} />, path: ROUTES_PATH.CHAT_SETTINGS },
];

const SidebarPrimaryActions = ({ isExpanded }: SidebarPrimaryActionsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { collapseSidebar, startNewChat, closeFilesPanel } = usePaceContext();

  const handleNavigate = (path: string) => {
    collapseSidebar();
    router.push(path);
  };

  const handleNewChat = () => {
    startNewChat();

    const params = new URLSearchParams(window.location.search);

    Object.values(TAB_QUERY_PARAM).forEach((key) => params.delete(key));
    const search = params.toString();

    window.history.replaceState(null, '', search ? `${window.location.pathname}?${search}` : window.location.pathname);

    dispatch(dynamicTabsActions.setActiveTab(null));
    closeFilesPanel();
    handleNavigate(ROUTES_PATH.CHAT);
  };

  return (
    <div className='flex shrink-0 flex-col gap-y-0.5 px-3 pt-4'>
      <SidebarRow icon={<Plus size={16} />} label='New chat' isExpanded={isExpanded} onClick={handleNewChat} />
      {NAV_ITEMS.map((item) => (
        <SidebarRow
          key={item.path}
          icon={item.icon}
          label={item.label}
          isExpanded={isExpanded}
          isActive={pathname?.startsWith(item.path) ?? false}
          onClick={() => handleNavigate(item.path)}
        />
      ))}
    </div>
  );
};

export default SidebarPrimaryActions;
