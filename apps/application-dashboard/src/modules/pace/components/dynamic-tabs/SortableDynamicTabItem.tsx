'use client';

import { type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import DynamicTabItem from 'modules/pace/components/dynamic-tabs/DynamicTabItem';
import { DynamicTab } from '@/modules/pace/pace.types';

const CLOSE_BUTTON_SELECTOR = '#dynamic-tab-close-button';
const TAB_MAX_WIDTH = 172;
const TAB_ENTER_TRANSITION = { duration: 0.2, ease: [0.2, 0, 0, 1] } as const;
const TAB_EXIT_TRANSITION = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const;

interface SortableDynamicTabItemProps {
  tab: DynamicTab;
  isActive: boolean;
  isAnyDragging: boolean;
  tabIndex: number;
  totalTabs: number;
  skipAnimation?: boolean;
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
  skipAnimation = false,
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
    maxWidth: TAB_MAX_WIDTH,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={skipAnimation ? false : { maxWidth: 0, opacity: 0 }}
      animate={skipAnimation ? false : { maxWidth: TAB_MAX_WIDTH, opacity: 1 }}
      exit={{ maxWidth: 0, opacity: 0, transition: TAB_EXIT_TRANSITION }}
      transition={TAB_ENTER_TRANSITION}
      layout={false}
      {...attributes}
      {...listeners}
      className={cn('min-w-0 flex-1 overflow-hidden select-none', { 'opacity-50': isDragging })}
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
    </motion.div>
  );
};

export default SortableDynamicTabItem;
