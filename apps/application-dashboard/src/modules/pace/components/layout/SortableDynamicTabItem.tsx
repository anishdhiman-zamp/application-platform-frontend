'use client';

import { type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@zamp-platform/ui/utils';
import DynamicTabItem from '@/modules/pace/components/layout/DynamicTabItem';
import { DynamicTab } from '@/modules/pace/pace.types';

const CLOSE_BUTTON_SELECTOR = '#dynamic-tab-close-button';

interface SortableDynamicTabItemProps {
  tab: DynamicTab;
  isActive: boolean;
  isAnyDragging: boolean;
  onClose: (e: React.MouseEvent, id: string) => void;
}

const SortableDynamicTabItem = ({ tab, isActive, isAnyDragging, onClose }: SortableDynamicTabItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
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
      className={cn('max-w-[172px] min-w-[48px] flex-1 select-none', { 'opacity-50': isDragging })}
      onClick={(e) => {
        const target = e.target as HTMLElement;

        // Prevent navigation when clicking the close button
        if (target.closest(CLOSE_BUTTON_SELECTOR)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <DynamicTabItem tab={tab} isActive={isActive} isDragging={isAnyDragging} onClose={onClose} />
    </div>
  );
};

export default SortableDynamicTabItem;
