import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, useEffect, useRef, useState } from 'react';

import { useDatasetColumnContext } from '../context/DatasetColumnContext';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import ColumnTypeDropdown from './ColumnTypeDropdown';
import DatasetColumDetails from './DatasetColumDetails';
import DatasetColumnHeader from './DatasetColumnHeader';

interface BluePrintDatasetProps {
  datasetId?: string; // If provided, it's an existing dataset
}

const BluePrintDataset: FC<BluePrintDatasetProps> = () => {
  // Use unified context for column management
  const {
    getBlueprintColumns,
    handleColumnChange: contextHandleColumnChange,
    handleDeleteColumn: contextHandleDeleteColumn,
    handleAddColumn: contextHandleAddColumn,
    handleReorderColumns,
  } = useDatasetColumnContext(); // Get columns from context
  const columns = getBlueprintColumns();
  const isInitialMountRef = useRef(true);
  const prevColumnCountRef = useRef(columns.length);
  const [lastAddedColumnId, setLastAddedColumnId] = useState<string | null>(null);
  const [buttonAnimationKey, setButtonAnimationKey] = useState(0);

  const handleColumnChange = (id: string, field: string, value: string | boolean) => {
    contextHandleColumnChange(id, field, value);
  };

  const handleDeleteColumn = (id: string) => {
    contextHandleDeleteColumn(id);
  };

  const handleAddColumn = (type: string) => {
    contextHandleAddColumn(type);
  };

  // Handle drag-and-drop with context
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { sensors, modifiers } = useDragAndDrop({
    items: columns,
    setItems: () => {},
  });

  // Custom drag end handler that updates context directly
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex((col) => col.id === active.id);
    const newIndex = columns.findIndex((col) => col.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Create new array with reordered columns
    const reordered = [...columns];
    const [movedItem] = reordered.splice(oldIndex, 1);

    reordered.splice(newIndex, 0, movedItem);

    // Update context with new order
    handleReorderColumns(reordered);
  };

  // Handle tracking newly added columns for auto-focus
  const trackColumnChanges = () => {
    const prevCount = prevColumnCountRef.current;
    const currentCount = columns.length;

    // Skip on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevColumnCountRef.current = currentCount;

      return;
    }

    if (currentCount > prevCount) {
      // Adding a column - track the newly added column for auto-focus
      if (columns.length > 0) {
        setLastAddedColumnId(columns[columns.length - 1].id);
      }
      setButtonAnimationKey((prev) => prev + 1);
    } else if (currentCount < prevCount) {
      // Deleting a column
      setLastAddedColumnId(null);
    }

    prevColumnCountRef.current = currentCount;
  };

  useEffect(() => {
    trackColumnChanges();
  }, [columns.length]);

  // Auto-scroll to bottom when new columns are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [columns.length]);

  return (
    <div className='flex h-full flex-col'>
      <div className='sticky top-0 z-[100] bg-white'>
        <DatasetColumnHeader />
      </div>
      <div ref={scrollContainerRef} className='max-h-[calc(100vh-150px)] min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col overflow-hidden pb-4'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={modifiers}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.filter((col) => col.id).map((col) => col.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {columns
                  .filter((col) => col.id)
                  .map((col) => (
                    <DatasetColumDetails
                      key={col.id}
                      columnData={col}
                      onChange={handleColumnChange}
                      onDelete={handleDeleteColumn}
                      shouldAutoFocus={col.id === lastAddedColumnId}
                    />
                  ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
          <motion.div
            key={buttonAnimationKey}
            className='pt-3 pl-9'
            initial={buttonAnimationKey > 0 ? { opacity: 0, y: -20 } : false}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.15, 0.0, 0.4, 1.0] } }}
          >
            <ColumnTypeDropdown onTypeSelect={handleAddColumn} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BluePrintDataset;
