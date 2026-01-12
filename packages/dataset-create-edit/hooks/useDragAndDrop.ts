import { DragEndEvent, KeyboardSensor, Modifier, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Dispatch, SetStateAction, useCallback } from 'react';

/**
 * Custom modifier to prevent dragging items above the first item in the list
 */
const restrictToFirstItem: Modifier = ({ transform, draggingNodeRect, containerNodeRect }) => {
  if (!draggingNodeRect || !containerNodeRect) {
    return transform;
  }

  // Prevent dragging above the container's top edge
  const minY = containerNodeRect.top - draggingNodeRect.top;

  return {
    ...transform,
    y: Math.max(transform.y, minY),
  };
};

interface UseDragAndDropOptions<T extends { id: string }> {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  /**
   * Additional modifiers to apply to the drag operation
   * By default, restrictToVerticalAxis and restrictToParentElement are applied
   */
  additionalModifiers?: Modifier[];
  /**
   * Whether to restrict dragging to prevent items from going above the first item
   * @default true
   */
  restrictToFirst?: boolean;
}

interface UseDragAndDropReturn {
  sensors: ReturnType<typeof useSensors>;
  modifiers: Modifier[];
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * A reusable hook for implementing drag and drop functionality with dnd-kit
 */
export const useDragAndDrop = <T extends { id: string }>({
  setItems,
  additionalModifiers = [],
  restrictToFirst = true,
}: UseDragAndDropOptions<T>): UseDragAndDropReturn => {
  // Set up sensors for drag operations
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Build modifiers array
  const modifiers: Modifier[] = [
    restrictToVerticalAxis,
    restrictToParentElement,
    ...(restrictToFirst ? [restrictToFirstItem] : []),
    ...additionalModifiers,
  ];

  // Handle drag end event
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setItems((currentItems) => {
          const oldIndex = currentItems.findIndex((item) => item.id === active.id);
          const newIndex = currentItems.findIndex((item) => item.id === over.id);

          return arrayMove(currentItems, oldIndex, newIndex);
        });
      }
    },
    [setItems],
  );

  return {
    sensors,
    modifiers,
    handleDragEnd,
  };
};
