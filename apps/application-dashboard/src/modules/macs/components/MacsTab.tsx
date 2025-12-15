'use client';

import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { FileBarChart, FileText, LayoutDashboard, Puzzle, Shapes, X } from 'lucide-react';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { Tab, TabType } from '@/modules/macs/types';

interface MacsTabProps {
  tab: Tab;
}

const TAB_ICONS: Record<TabType, React.ComponentType<{ size?: number; className?: string }>> = {
  capabilities: Puzzle,
  components: Shapes,
  report: FileBarChart,
  dashboard: LayoutDashboard,
  page: FileText,
};

const MacsTab = ({ tab }: MacsTabProps) => {
  const { activeTabId, setActiveTab, removeTab } = useMacsContext();
  const isActive = activeTabId === tab.id;
  const Icon = TAB_ICONS[tab.type];

  const handleClick = () => {
    setActiveTab(tab.id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeTab(tab.id);
  };

  return (
    <div
      className={cn(
        'flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2 transition-colors',
        isActive
          ? 'border-gray-400 bg-white text-gray-900'
          : 'border-transparent bg-transparent text-gray-600 hover:bg-gray-100',
      )}
      onClick={handleClick}
    >
      {Icon && <Icon size={14} className='flex-shrink-0' />}
      <span className='f-12-500 max-w-[120px] truncate'>{tab.title}</span>
      <Button
        variant='ghost'
        size='icon'
        className='h-4 w-4 p-0 text-gray-500 hover:text-gray-900'
        onClick={handleClose}
      >
        <X size={12} />
      </Button>
    </div>
  );
};

export default MacsTab;
