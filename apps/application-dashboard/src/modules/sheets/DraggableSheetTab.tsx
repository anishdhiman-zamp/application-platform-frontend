import { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@zamp-platform/ui/utils';
import SheetTab from 'modules/sheets/SheetTab';
import { MenuItem } from '@/types/common/components';
import { defaultFnType } from '@/types/commonTypes';

const DraggableSheetTab = ({
  tab,
  currentSheetId,
  handleTabSelect,
  allSheets,
  onCreateSheet,
}: {
  tab: MenuItem;
  currentSheetId: string;
  handleTabSelect: (tab: MenuItem, isFromOverflow?: boolean) => void;
  allSheets?: MenuItem[];
  onCreateSheet: defaultFnType;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.value });
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
      className={cn('inline-flex', { invisible: isDragging })}
    >
      <SheetTab
        tab={tab}
        currentSheetId={currentSheetId}
        handleTabSelect={handleTabSelect}
        allSheets={allSheets}
        onCreateSheet={onCreateSheet}
      />
    </div>
  );
};

export default DraggableSheetTab;
