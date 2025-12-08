import React, { FC } from 'react';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ColumnTypeDropdown from 'modules/process/dataset-create-edit/components/ColumnTypeDropdown';
import DatasetColumDetails from 'modules/process/dataset-create-edit/components/DatasetColumDetails';
import DatasetColumnHeader from 'modules/process/dataset-create-edit/components/DatasetColumnHeader';
import { useDatasetColumns } from 'modules/process/dataset-create-edit/hooks/useDatasetColumns';

const BluePrintDataset: FC = () => {
  const {
    columns,
    sensors,
    scrollContainerRef,
    modifiers,
    handleColumnChange,
    handleDeleteColumn,
    handleAddColumn,
    handleDragEnd,
  } = useDatasetColumns();

  return (
    <div className='flex h-full flex-col'>
      <div ref={scrollContainerRef} className='min-h-0 overflow-y-scroll'>
        <div className='sticky top-0 z-[100] bg-white'>
          <DatasetColumnHeader />
        </div>
        <div className='relative'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={modifiers}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columns} strategy={verticalListSortingStrategy}>
              {columns.map((col) => (
                <DatasetColumDetails
                  key={col.id}
                  columnData={col}
                  onChange={handleColumnChange}
                  onDelete={handleDeleteColumn}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <div className='shrink-0 pt-3 pb-4 pl-9.5'>
        <ColumnTypeDropdown onTypeSelect={handleAddColumn} />
      </div>
    </div>
  );
};

export default BluePrintDataset;
