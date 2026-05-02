'use client';

import { Bot, CheckSquare, LayoutGrid, Plus, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import SidebarRow from '@/modules/pace/components/layout/sidebar/SidebarRow';
import { usePaceContext } from '@/modules/pace/pace.context';

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
  const { collapseSidebar } = usePaceContext();

  const handleNavigate = (path: string) => {
    collapseSidebar();
    router.push(path);
  };

  return (
    <div className='flex shrink-0 flex-col gap-y-0.5 px-1.5'>
      <SidebarRow
        icon={<Plus size={16} />}
        label='New chat'
        isExpanded={isExpanded}
        onClick={() => handleNavigate(ROUTES_PATH.CHAT)}
      />
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
