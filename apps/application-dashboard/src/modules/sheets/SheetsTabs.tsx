import React, { FC, useEffect, useState } from 'react';
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
import { useParams, useRouter } from 'next/navigation';
import { RootState } from 'store';
import { MenuItem } from 'types/common/components';
import { cn } from 'utils/common';
import { LOCAL_STORAGE_KEYS } from 'utils/localstorage';
import { useCreateSheetMutation, useUpdateSheetIndexesByPageIdMutation } from '@/apis/pages';
import PermissionGuard from '@/components/hoc/PermissionGuard';
import { DEFAULT_SHEET_DESCRIPTION, DEFAULT_SHEET_NAME } from '@/constants/common.constants';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Tooltip, TooltipPositions } from 'components/common/tooltip';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

interface SheetsTabsProps {
  tabs: MenuItem[];
  currentSheetId: string;
}

const SheetsTabs: FC<SheetsTabsProps> = ({ tabs, currentSheetId }) => {
  const router = useRouter();
  const params = useParams();
  const [tabOrder, setTabOrder] = useState<string[]>(tabs.map((tab) => tab.value as string));
  const [activeId, setActiveId] = useState<string | null>(null);
  const pageId = params?.pageId as string;
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const [updateSheetIndexesByPageId] = useUpdateSheetIndexesByPageIdMutation();
  const [createSheet, { isLoading: isCreatingSheet }] = useCreateSheetMutation();
  const [isSelfServePagesEnabled, setIsSelfServePagesEnabled] = useState(false);

  const { evaluate, ldClient } = useFeatureFlags();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleTabSelect = (selected?: MenuItem) => {
    if (!selected?.value) return;
    router.push(`?sheetId=${selected?.value}`);

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
      const oldIndex = tabOrder.indexOf(active.id as string);
      const newIndex = tabOrder.indexOf((over?.id as string) ?? '');
      const updatedTabOrder = arrayMove(tabOrder, oldIndex, newIndex);

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
  };

  const handleCreateSheet = () => {
    createSheet({
      name: DEFAULT_SHEET_NAME,
      page_id: pageId,
      description: DEFAULT_SHEET_DESCRIPTION,
    })
      .unwrap()
      .then((res) => {
        router.push(`?sheetId=${res?.sheet?.sheet_id}`);
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

  useEffect(() => {
    if (ldClient) {
      evaluate(FEATURE_FLAGS.SELF_SERVE_PAGES)
        .then((res) => {
          setIsSelfServePagesEnabled(res);
        })
        .catch(() => {
          setIsSelfServePagesEnabled(false);
        });
    }
  }, [evaluate, ldClient]);

  return (
    <div
      className={cn(
        'border-border-GRAY_400 shadow-page-bottom-bar fixed right-0 bottom-0 z-1000 flex h-[57px] items-center gap-3 border-t border-l bg-white px-8 transition-all duration-300',
        !isSidebarOpen ? 'w-full' : 'w-[calc(100%-240px)]',
      )}
    >
      <CommonWrapper
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<div className='bg-GRAY_50 block h-8 w-25 animate-pulse rounded-md' />}
        className='w-fit'
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveId(String(event.active.id))}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tabOrder} strategy={horizontalListSortingStrategy}>
            <div className='flex gap-3'>
              {tabOrder.map((id) => {
                const tab = tabs.find((t) => t.value === id);

                if (!tab) return null;

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
                  tab={tabs.find((t) => t.value === activeId) ?? { value: '', label: '' }}
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
      {isSelfServePagesEnabled ? (
        <PermissionGuard resourceType={ResourceType.PAGE} resourceId={pageId} privilege={PAGE_ACCESS_PRIVILEGES.ADMIN}>
          <Button
            size='medium'
            variant='secondary'
            onClick={handleCreateSheet}
            className='h-[34px] min-w-25 gap-1 [&_svg]:size-3.5'
            isLoading={isCreatingSheet}
          >
            <SvgSpriteLoader id='plus' className='text-gray-500' />
            <div className='whitespace-nowrap'>Add sheet</div>
          </Button>
        </PermissionGuard>
      ) : (
        <Tooltip
          tooltipBody='Coming soon'
          color='{TMS_COLORS.GRAY_200}'
          tooltipBodyClassName='f-12-300 px-3 py-1.5 rounded-md whitespace-nowrap z-999 bg-black text-GRAY_200'
          className='z-1'
          position={TooltipPositions.TOP}
        >
          <div className='f-12-450 text-GRAY_700 flex cursor-not-allowed items-center gap-1 select-none'>
            <SvgSpriteLoader id='plus' width={16} height={16} />
            <div className='whitespace-nowrap'>New sheet</div>
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default SheetsTabs;
