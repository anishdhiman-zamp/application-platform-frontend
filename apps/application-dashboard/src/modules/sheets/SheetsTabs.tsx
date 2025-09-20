import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { Button, toast } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useAppSelector } from 'hooks/toolkit';
import { PAGE_ACCESS_PRIVILEGES, ResourceType } from 'modules/shareResource';
import DraggableSheetTab from 'modules/sheets/DraggableSheetTab';
import SheetTab from 'modules/sheets/SheetTab';
import TabsOverflowMenu from 'modules/sheets/TabsOverflowMenu';
import { useTabsOverflow } from 'modules/sheets/useTabsOverflow';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { RootState } from 'store';
import { MenuItem } from 'types/common/components';
import { cn } from 'utils/common';
import { LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { useCreateSheetMutation, useUpdateSheetIndexesByPageIdMutation } from '@/apis/pages';
import PermissionGuard from '@/components/hoc/PermissionGuard';
import { DEFAULT_SHEET_DESCRIPTION, DEFAULT_SHEET_NAME } from '@/constants/common.constants';
import { getPageRouteById } from '@/constants/routeConfig';
import { useElementMeasurement } from '@/hooks/useElementMeasurement';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

interface SheetsTabsProps {
  tabs: MenuItem[];
  currentSheetId: string;
}

const SheetsTabs: FC<SheetsTabsProps> = ({ tabs, currentSheetId }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isFilterOpen = searchParams?.get('isFilterOpen') === 'true';
  const [tabOrder, setTabOrder] = useState<string[]>(tabs.map((tab) => tab.value as string));
  const [activeId, setActiveId] = useState<string | null>(null);
  const pageId = params?.pageId as string;
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const [updateSheetIndexesByPageId] = useUpdateSheetIndexesByPageIdMutation();
  const [createSheet, { isLoading: isCreatingSheet }] = useCreateSheetMutation();

  // Container measurement for responsive tabs
  const { ref: containerRef, dimensions: containerDimensions } = useElementMeasurement();

  // Create ordered tabs based on current tabOrder (memoized to prevent infinite re-renders)
  const orderedTabs = useMemo(() => {
    return tabOrder.map((id) => tabs.find((tab) => tab.value === id)).filter(Boolean) as MenuItem[];
  }, [tabOrder, tabs]);

  // Calculate overflow tabs
  const { visibleTabs, overflowTabs, shouldShowOverflow } = useTabsOverflow({
    tabs: orderedTabs,
    containerWidth: containerDimensions.width,
    tabMinWidth: 150,
    additionalElementsWidth: 180,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleTabSelect = (selected?: MenuItem, isFromOverflow?: boolean) => {
    if (!selected?.value) return;

    // Handle tab selection from overflow menu - swap with last visible tab
    if (isFromOverflow && visibleTabs.length > 0 && overflowTabs.length > 0) {
      const selectedTabId = selected.value as string;
      const lastVisibleTab = visibleTabs[visibleTabs.length - 1];
      const lastVisibleTabId = lastVisibleTab.value as string;

      // Find positions in the current tabOrder
      const selectedTabIndex = tabOrder.indexOf(selectedTabId);
      const lastVisibleTabIndex = tabOrder.indexOf(lastVisibleTabId);

      if (selectedTabIndex !== -1 && lastVisibleTabIndex !== -1) {
        // Create new tab order with swapped positions
        const newTabOrder = [...tabOrder];

        newTabOrder[selectedTabIndex] = lastVisibleTabId;
        newTabOrder[lastVisibleTabIndex] = selectedTabId;
        setTabOrder(newTabOrder);

        // Update the order and persist to API
        updateSheetIndexesByPageId({
          pageId,
          body: {
            sheets: newTabOrder.map((id, index) => ({ sheet_id: id, fractional_index: index + 1 })),
          },
        });
      }
    }

    // Navigate to selected sheet
    router.push(getPageRouteById(pageId, selected?.value as string));

    // Update localStorage
    const storedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.DATA_SHEET_ID) || '{}');

    if (pageId) {
      const validPageId = Array.isArray(pageId) ? pageId[0] : pageId;

      if (validPageId) {
        storedData[validPageId] = String(selected?.value);
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.DATA_SHEET_ID, JSON.stringify(storedData));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    if (active.id !== over?.id) {
      // Find the indices in the visible tabs only
      const visibleTabIds = visibleTabs.map((tab) => tab.value as string);
      const oldVisibleIndex = visibleTabIds.indexOf(active.id as string);
      const newVisibleIndex = visibleTabIds.indexOf((over?.id as string) ?? '');

      // Only allow reordering within visible tabs to maintain UX consistency
      if (oldVisibleIndex !== -1 && newVisibleIndex !== -1) {
        const oldGlobalIndex = tabOrder.indexOf(active.id as string);
        const newGlobalIndex = tabOrder.indexOf((over?.id as string) ?? '');
        const updatedTabOrder = arrayMove(tabOrder, oldGlobalIndex, newGlobalIndex);

        updateSheetIndexesByPageId({
          pageId,
          body: {
            sheets: updatedTabOrder.map((id, index) => ({ sheet_id: id, fractional_index: index + 1 })),
          },
        })
          .unwrap()
          .then(() => {
            toast.success('Sheet order updated successfully');
          })
          .catch(() => {
            toast.error('Failed to update sheet order');
          });
        setTabOrder(updatedTabOrder);
      }
    }
  };

  const handleCreateSheet = () => {
    createSheet({
      name: DEFAULT_SHEET_NAME,
      page_id: pageId,
      description: DEFAULT_SHEET_DESCRIPTION,
    })
      .unwrap()
      .then((res) => {
        router.push(getPageRouteById(pageId, res?.sheet?.sheet_id));
        toast.success('Sheet created successfully');
      })
      .catch(() => {
        toast.error('Failed to create sheet');
      });
  };

  // Sync tabOrder with tabs whenever tabs changes
  useEffect(() => {
    setTabOrder(tabs.map((tab) => tab.value as string));
  }, [tabs]);

  // Determine positioning and width based on sidebar and filter states
  const getPositionClasses = () => {
    if (isFilterOpen) {
      return isSidebarOpen ? 'left-60 w-[calc(100%-540px)]' : 'left-0 w-[calc(100%-300px)]';
    }

    return isSidebarOpen ? 'right-0 w-[calc(100%-240px)]' : 'right-0 w-full';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'border-border-GRAY_400 shadow-page-bottom-bar fixed bottom-0 z-1000 flex h-[57px] items-center gap-3 border-t border-l bg-white px-8 transition-all duration-300',
        getPositionClasses(),
      )}
    >
      {/* Tabs Container - takes available space minus buttons */}
      <div className='flex min-w-0 items-center gap-3 overflow-hidden'>
        <CommonWrapper
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<div className='bg-GRAY_50 block h-8 w-25 animate-pulse rounded-md' />}
          className='flex min-w-0'
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => setActiveId(String(event.active.id))}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleTabs.map((tab) => tab.value as string)}
              strategy={horizontalListSortingStrategy}
            >
              <div className='flex min-w-0 gap-3 overflow-hidden'>
                {visibleTabs.map((tab) => {
                  return (
                    <DraggableSheetTab
                      key={tab.value}
                      tab={tab}
                      currentSheetId={currentSheetId}
                      handleTabSelect={handleTabSelect}
                      allSheets={tabs}
                      onCreateSheet={handleCreateSheet}
                    />
                  );
                })}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className='-rotate-2'>
                  <SheetTab
                    tab={orderedTabs.find((t) => t.value === activeId) ?? { value: '', label: '' }}
                    currentSheetId={currentSheetId}
                    handleTabSelect={handleTabSelect}
                    allSheets={tabs}
                    onCreateSheet={handleCreateSheet}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </CommonWrapper>

        {/* Overflow Menu */}
        {shouldShowOverflow && <TabsOverflowMenu overflowTabs={overflowTabs} handleTabSelect={handleTabSelect} />}
      </div>

      {/* Add Sheet Button - fixed width */}
      <PermissionGuard resourceType={ResourceType.PAGE} resourceId={pageId} privilege={PAGE_ACCESS_PRIVILEGES.ADMIN}>
        <Button
          size='medium'
          variant='secondary'
          onClick={handleCreateSheet}
          className='h-[34px] min-w-25 shrink-0 gap-1 [&_svg]:size-3.5'
          isLoading={isCreatingSheet}
        >
          <SvgSpriteLoader id='plus' className='text-gray-500' />
          <div className='whitespace-nowrap'>Add sheet</div>
        </Button>
      </PermissionGuard>
    </div>
  );
};

export default SheetsTabs;
