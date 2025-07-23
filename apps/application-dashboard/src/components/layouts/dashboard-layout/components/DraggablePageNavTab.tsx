import { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@zamp-platform/ui/utils';
import Link from 'next/link';
import { getPageRouteById } from '@/constants/routeConfig';
import PageNavTab, { PageNavTabProps } from 'components/layouts/dashboard-layout/components/PageNavTab';

const DraggablePageNavTab = ({ pageId, label, isSelected }: PageNavTabProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pageId,
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
      className={cn('select-none', { invisible: isDragging })}
    >
      <Link href={getPageRouteById(pageId)} className='cursor-pointer' prefetch>
        <PageNavTab label={label} pageId={pageId} isSelected={isSelected} />
      </Link>
    </div>
  );
};

export default DraggablePageNavTab;
