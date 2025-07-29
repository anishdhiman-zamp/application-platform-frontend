import { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@zamp-platform/ui/utils';
import SheetTab from 'modules/sheets/SheetTab';
import { MenuItem } from '@/types/common/components';

const DraggableSheetTab = ({
  tab,
  currentSheetId,
  handleTabSelect,
}: {
  tab: MenuItem;
  currentSheetId: string;
  handleTabSelect: (tab: MenuItem) => void;
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
      <SheetTab tab={tab} currentSheetId={currentSheetId} handleTabSelect={handleTabSelect} />
    </div>
  );
};

export default DraggableSheetTab;
