import { FC, useEffect, useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { useRouter } from 'next/navigation';
import { useCreatePageMutation, useUpdatePageIndexesMutation } from '@/apis/pages';
import TooltipV2 from '@/components/common/TooltipV2';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { DEFAULT_PAGE_DESCRIPTION, DEFAULT_PAGE_NAME, DEFAULT_SHEET_NAME } from '@/constants/common.constants';
import { getPageRouteById } from '@/constants/routeConfig';
import { PageResponseType } from '@/types/api/pagesApi.types';
import { ProcessesResponseType } from '@/types/api/processApi.types';
import DraggablePageNavTab from 'components/layouts/dashboard-layout/components/DraggablePageNavTab';
import PageNavTab from 'components/layouts/dashboard-layout/components/PageNavTab';
import SkeletonLoaderSidebarPages from 'components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';

type PagesNavigationProps = {
  pages?: PageResponseType[];
  processes?: ProcessesResponseType[];
  isLoading: boolean;
  params: Record<string, string | string[]> | null;
};

const PagesNavigation: FC<PagesNavigationProps> = ({ pages, processes, isLoading, params }) => {
  const router = useRouter();

  const [pageOrder, setPageOrder] = useState<string[]>(pages?.map((p) => p.page_id) || []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [updatePageIndexes] = useUpdatePageIndexesMutation();
  const [createPage, { isLoading: isCreatingPage }] = useCreatePageMutation();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setOverId(event.active.id as string); // Start with the dragged item
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.over?.id) {
      setOverId(event.over.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);
    if (active.id !== over?.id) {
      const oldIndex = pageOrder.indexOf(active.id as string);
      const newIndex = pageOrder.indexOf((over?.id as string) ?? '');
      const updatedPageOrder = arrayMove(pageOrder, oldIndex, newIndex);

      updatePageIndexes({
        pages: updatedPageOrder.map((id, index) => ({ page_id: id, fractional_index: index + 1 })),
      })
        .unwrap()
        .then(() => {
          toast.success('Page order updated successfully');
        })
        .catch(() => {
          toast.error('Failed to update page order');
        });

      setPageOrder(updatedPageOrder);
    }
  };

  const handleCreatePage = () => {
    createPage({
      page_name: DEFAULT_PAGE_NAME,
      page_description: DEFAULT_PAGE_DESCRIPTION,
      sheet_name: DEFAULT_SHEET_NAME,
    })
      .unwrap()
      .then((res) => {
        router.push(getPageRouteById(res?.page?.page_id, res?.sheet?.sheet_id));
      })
      .catch(() => {
        toast.error('Failed to create page');
      });
  };

  // Calculate drop indicator index (where the black line should appear)
  const dropIndicatorIndex = useMemo(() => {
    if (activeId && overId && activeId !== overId) {
      return pageOrder.indexOf(overId);
    }

    return -1;
  }, [activeId, overId, pageOrder]);

  useEffect(() => {
    if (pages) setPageOrder(pages.map((p) => p.page_id));
  }, [pages]);

  return (
    <>
      {!!pages?.length && (
        <div className={cn('px-2', processes?.length === 0 ? 'py-2.5' : 'py-0')}>
          <div className='flex items-center justify-between'>
            <div className='f-12-550 text-GRAY_700 px-1.5 py-2'>Pages</div>
            <TooltipV2 tooltipBody='Add page' asChildTrigger>
              <Button
                size='xxsmall'
                variant='ghost'
                onClick={handleCreatePage}
                className='[&_svg]:size-3.5'
                isLoading={isCreatingPage}
                data-testid='add-page-btn'
              >
                <SvgSpriteLoader id='plus' className='text-gray-700' />
              </Button>
            </TooltipV2>
          </div>
          <CommonWrapper
            isLoading={isLoading}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<SkeletonLoaderSidebarPages />}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={pageOrder} strategy={verticalListSortingStrategy}>
                {pageOrder.map((pageId, idx) => {
                  const page = pages?.find((p) => p.page_id === pageId);

                  if (!page) return null;

                  // Render drop indicator line above the hovered item
                  return (
                    <div key={pageId} className='relative'>
                      <DraggablePageNavTab
                        pageId={page.page_id}
                        label={page.name}
                        isSelected={params?.pageId === page.page_id}
                        page={page}
                        defaultSheetId={page?.sheets?.[0]?.sheet_id}
                      />
                      {dropIndicatorIndex === idx && (
                        <div className='absolute right-0 bottom-0 left-0 z-10 h-0.5 rounded-full bg-black' />
                      )}
                    </div>
                  );
                })}
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className='-rotate-2 rounded-md border shadow-lg'>
                    <PageNavTab
                      key={activeId}
                      label={pages?.find((p) => p.page_id === activeId)?.name || ''}
                      pageId={activeId}
                      isSelected={false}
                      page={pages?.find((p) => p.page_id === activeId) || pages?.[0]}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </CommonWrapper>
        </div>
      )}
    </>
  );
};

export default PagesNavigation;
