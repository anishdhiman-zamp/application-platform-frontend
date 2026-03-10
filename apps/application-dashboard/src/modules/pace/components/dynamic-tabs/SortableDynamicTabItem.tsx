'use client';

import { type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@zamp-platform/ui/utils';
import DynamicTabItem from 'modules/pace/components/dynamic-tabs/DynamicTabItem';
import { DynamicTab } from '@/modules/pace/pace.types';

const CLOSE_BUTTON_SELECTOR = '#dynamic-tab-close-button';

interface SortableDynamicTabItemProps {
  tab: DynamicTab;
  isActive: boolean;
  isAnyDragging: boolean;
  tabIndex: number;
  totalTabs: number;
  onClose: (e: React.MouseEvent, id: string) => void;
  onCloseOthers: (id: string) => void;
  onCloseToRight: (id: string) => void;
  onCloseAll: () => void;
}

const SortableDynamicTabItem = ({
  tab,
  isActive,
  isAnyDragging,
  tabIndex,
  totalTabs,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onCloseAll,
}: SortableDynamicTabItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.stableKey,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('max-w-[172px] min-w-[32px] flex-1 select-none', { 'opacity-50': isDragging })}
      onClick={(e) => {
        const target = e.target as HTMLElement;

        if (target.closest(CLOSE_BUTTON_SELECTOR)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <DynamicTabItem
        tab={tab}
        isActive={isActive}
        isDragging={isAnyDragging}
        tabIndex={tabIndex}
        totalTabs={totalTabs}
        onClose={onClose}
        onCloseOthers={onCloseOthers}
        onCloseToRight={onCloseToRight}
        onCloseAll={onCloseAll}
      />
    </div>
  );
};

export default SortableDynamicTabItem;
