import { CSSProperties, FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@zamp-platform/ui/utils';
import { getPageRouteById } from 'constants/routeConfig';
import Link from 'next/link';
import { PageResponseType } from 'types/api/pagesApi.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';
import PageNavTab from 'components/layouts/dashboard-layout/components/PageNavTab';

interface DraggablePageNavTabProps {
  pageId: string;
  label: string;
  isSelected: boolean;
  page: PageResponseType;
  defaultSheetId: string;
}

const selectors = [
  '#page-nav-tab-delete-page-button',
  '#page-nav-tab-popover-trigger',
  '#page-nav-tab-popover-content',
  '#delete-page-dialog',
];

const DraggablePageNavTab: FC<DraggablePageNavTabProps> = ({ pageId, label, isSelected, page, defaultSheetId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pageId,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lastVisitedSheetId =
    JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISITED_SHEET_ID) || '{}')[pageId] || defaultSheetId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn('select-none', { invisible: isDragging })}
    >
      <Link
        href={getPageRouteById(pageId, lastVisitedSheetId)}
        className='cursor-pointer'
        prefetch
        onClick={(e) => {
          const target = e.target as HTMLElement;

          if (selectors.some((selector) => target.closest(selector))) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <PageNavTab label={label} pageId={pageId} isSelected={isSelected} page={page} />
      </Link>
    </div>
  );
};

export default DraggablePageNavTab;
