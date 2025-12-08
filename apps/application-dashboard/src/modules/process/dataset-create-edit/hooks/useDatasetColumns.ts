import { useEffect, useRef, useState } from 'react';
import { DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ColumnDataType, DatasetColumnTypes } from 'modules/process/process.types';

export const useDatasetColumns = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<ColumnDataType[]>([
    { id: '1', column_name: 'New Column', column_type: DatasetColumnTypes.TEXT, required: false },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [columns.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleColumnChange = (id: string, field: string, value: any) => {
    setColumns((prev) => prev.map((col) => (col.id === id ? { ...col, [field]: value } : col)));
  };

  const handleDeleteColumn = (id: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== id));
  };

  const handleAddColumn = (type: string) => {
    setTimeout(() => {
      const newColumn: ColumnDataType = {
        id: crypto.randomUUID(),
        column_name: '',
        column_type: type,
        required: false,
      };

      setColumns((prev) => [...prev, newColumn]);
    }, 250);
  };

  return {
    columns,
    sensors,
    scrollContainerRef,
    handleDragEnd,
    handleColumnChange,
    handleDeleteColumn,
    handleAddColumn,
  };
};
