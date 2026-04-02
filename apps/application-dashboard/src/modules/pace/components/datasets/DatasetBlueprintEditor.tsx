'use client';

import { FC, memo, useCallback, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnTypeDropdown, DatasetColumnTypes, RequiredDefaultValueModal } from '@zamp-platform/dataset-create-edit';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Input,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { GripVertical, Trash2 } from 'lucide-react';
import type { BlueprintColumn } from 'modules/pace/components/datasets/datasets.constants';

const COL_PREFIX = 'col_';

const HEADERS: ReadonlyArray<{ label: string; key: string; width?: number }> = [
  { label: '', key: 'grip', width: 30 },
  { label: 'Column Name', key: 'column_name', width: 380 },
  { label: 'Column Type', key: 'column_type', width: 200 },
  { label: 'Required', key: 'required' },
  { label: '', key: 'actions', width: 20 },
];

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  columnName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: FC<DeleteConfirmDialogProps> = ({ isOpen, columnName, onOpenChange, onConfirm }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent size='small' showCloseButton className='w-[400px]'>
      <DialogHeader>
        <DialogHeaderTitle>Delete column &apos;{columnName}&apos;</DialogHeaderTitle>
      </DialogHeader>
      <DialogBody className='f-14-400 p-5'>
        Are you sure you want to delete this column? This action cannot be undone.
      </DialogBody>
      <DialogFooter className='flex justify-end gap-2.5'>
        <DialogClose asChild>
          <Button variant='secondary' size='medium'>
            Cancel
          </Button>
        </DialogClose>
        <Button
          variant='destructive'
          size='medium'
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface ColumnRowProps {
  column: BlueprintColumn;
  allColumns: BlueprintColumn[];
  canEdit: boolean;
  onChangeName: (id: string, name: string) => void;
  onChangeType: (id: string, type: DatasetColumnTypes) => void;
  onChangeRequired: (id: string, required: boolean, defaultValue?: string | null) => void;
  onDelete: (id: string) => void;
}

/* eslint-disable react/prop-types */
const ColumnRow: FC<ColumnRowProps> = memo(
  ({ column, allColumns, canEdit, onChangeName, onChangeType, onChangeRequired, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    const [localName, setLocalName] = useState(column.name);
    const [isRequiredModalOpen, setIsRequiredModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const nameError = (() => {
      const trimmed = localName.trim();

      if (!trimmed) return 'Column name cannot be empty';
      if (column.id.startsWith(COL_PREFIX) && /[^a-zA-Z0-9 ]/.test(trimmed)) {
        return 'Column name can only contain alphabets, numbers, and spaces';
      }
      const normalised = trimmed.toLowerCase();
      const dupes = allColumns.filter((c) => c.name.trim().toLowerCase() === normalised);

      if (dupes.length > 1 && dupes[dupes.length - 1].id === column.id) return 'Column names must be unique';

      return null;
    })();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalName(e.target.value);
      onChangeName(column.id, e.target.value);
    };

    const handleTypeChange = (type: string) => {
      if (type !== column.type) {
        onChangeRequired(column.id, false, null);
      }
      onChangeType(column.id, type as DatasetColumnTypes);
    };

    const handleRequiredToggle = (checked: boolean) => {
      if (checked) {
        setIsRequiredModalOpen(true);
      } else {
        onChangeRequired(column.id, false, null);
      }
    };
    const handleRequiredConfirm = (defaultValue: string) => {
      onChangeRequired(column.id, true, defaultValue);
      setIsRequiredModalOpen(false);
    };
    const handleRequiredDismiss = () => {
      onChangeRequired(column.id, false, null);
      setIsRequiredModalOpen(false);
    };

    return (
      <>
        <div ref={setNodeRef} style={{ ...style, zIndex: isDragging ? 999 : undefined }}>
          <div
            className={cn(
              'border-GRAY_100 bg-BG_WHITE flex items-center justify-between border-b py-2.5 pr-8 pl-4',
              !canEdit && 'opacity-60',
            )}
          >
            <div className='flex w-full flex-col items-start'>
              <div className='flex w-full items-center justify-between'>
                {/* Grip */}
                <div style={{ width: HEADERS[0].width, flex: 'none' }}>
                  <div {...listeners} {...attributes} className='flex-shrink-0 cursor-grab touch-none'>
                    <GripVertical className='text-GRAY_500 h-4 w-4' />
                  </div>
                </div>

                {/* Column Name */}
                <div
                  className='f-12-450 text-GRAY_700 flex min-w-0 items-start pr-12'
                  style={{ width: HEADERS[1].width, flex: 'none' }}
                >
                  <Input
                    placeholder='Column Name'
                    className='text-GRAY_1000 h-8 min-w-0'
                    wrapperClassName='flex-1 min-w-0'
                    error={!!nameError}
                    value={localName}
                    onChange={handleNameChange}
                    disabled={!canEdit}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Column Type */}
                <div
                  className='f-12-450 text-GRAY_700 flex items-start'
                  style={{ width: HEADERS[2].width, flex: 'none' }}
                >
                  <div className='w-full pr-4'>
                    <ColumnTypeDropdown
                      label='Columns'
                      selectedType={column.type}
                      onTypeSelect={handleTypeChange}
                      selectedClassName='bg-GRAY_50 border-none'
                      triggerClassName='px-1.5 py-1 h-6 f-12-450 text-GRAY_1000'
                      disabled
                    />
                  </div>
                </div>

                {/* Required */}
                <div className='f-12-450 text-GRAY_700 min-w-0 flex-1'>
                  <Switch
                    checked={column.required}
                    onCheckedChange={handleRequiredToggle}
                    size='medium'
                    disabled={!canEdit}
                  />
                </div>

                {/* Actions (delete) */}
                <div style={{ width: HEADERS[4].width, flex: 'none' }}>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type='button'
                          onClick={() => {
                            if (allColumns.length > 1) setIsDeleteDialogOpen(true);
                          }}
                          disabled={!canEdit}
                          className={cn(
                            'text-GRAY_600 flex cursor-pointer items-center gap-1.5 pr-4 pl-2 transition-colors disabled:cursor-not-allowed',
                            allColumns.length === 1
                              ? 'disabled:text-GRAY_300 hover:text-GRAY_300 cursor-not-allowed'
                              : 'hover:text-GRAY_900 cursor-pointer',
                          )}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom' className='f-12-400'>
                        Delete column
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {nameError && <span className='f-11-400 text-RED_700 mt-2 ml-6 text-xs'>{nameError}</span>}
            </div>
          </div>
        </div>

        <RequiredDefaultValueModal
          isOpen={isRequiredModalOpen}
          onClose={() => setIsRequiredModalOpen(false)}
          onDismiss={handleRequiredDismiss}
          onConfirm={handleRequiredConfirm}
          columnType={column.type}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          columnName={column.name}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={() => onDelete(column.id)}
        />
      </>
    );
  },
  (prev, next) =>
    prev.column.id === next.column.id &&
    prev.column.name === next.column.name &&
    prev.column.type === next.column.type &&
    prev.column.required === next.column.required &&
    prev.canEdit === next.canEdit &&
    prev.allColumns.length === next.allColumns.length &&
    JSON.stringify(prev.allColumns.map((c) => c.name.toLowerCase().trim()).sort()) ===
      JSON.stringify(next.allColumns.map((c) => c.name.toLowerCase().trim()).sort()),
);

ColumnRow.displayName = 'ColumnRow';
/* eslint-enable react/prop-types */

export const generateColumnId = (): string =>
  `${COL_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const createDefaultColumn = (
  type: DatasetColumnTypes = DatasetColumnTypes.TEXT,
  index?: number,
): BlueprintColumn => ({
  id: generateColumnId(),
  name: index != null ? `Column ${index}` : '',
  type,
  required: false,
});

interface DatasetBlueprintEditorProps {
  columns: BlueprintColumn[];
  onChange: (columns: BlueprintColumn[]) => void;
  canEdit?: boolean;
}

const DatasetBlueprintEditor: FC<DatasetBlueprintEditorProps> = ({ columns, onChange, canEdit = true }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;
      const oldIdx = columns.findIndex((c) => c.id === active.id);
      const newIdx = columns.findIndex((c) => c.id === over.id);

      if (oldIdx === -1 || newIdx === -1) return;
      onChange(arrayMove(columns, oldIdx, newIdx));
    },
    [columns, onChange],
  );

  const handleChangeName = useCallback(
    (id: string, name: string) => onChange(columns.map((c) => (c.id === id ? { ...c, name } : c))),
    [columns, onChange],
  );

  const handleChangeType = useCallback(
    (id: string, type: DatasetColumnTypes) => onChange(columns.map((c) => (c.id === id ? { ...c, type } : c))),
    [columns, onChange],
  );

  const handleChangeRequired = useCallback(
    (id: string, required: boolean, defaultValue?: string | null) =>
      onChange(columns.map((c) => (c.id === id ? { ...c, required, defaultValue } : c))),
    [columns, onChange],
  );

  const handleDelete = useCallback((id: string) => onChange(columns.filter((c) => c.id !== id)), [columns, onChange]);

  const handleAddColumn = useCallback(
    (type: string) => {
      onChange([...columns, createDefaultColumn(type as DatasetColumnTypes, columns.length + 1)]);
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    },
    [columns, onChange],
  );

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='border-GRAY_100 flex items-center justify-between border-b pt-4 pr-8 pl-4'>
        {HEADERS.map((h) => (
          <div
            key={h.key}
            className={cn('f-12-450 text-GRAY_700 py-2.5', !h.width && 'flex-1')}
            style={h.width ? { width: h.width, flex: 'none' } : {}}
          >
            {h.label}
          </div>
        ))}
      </div>

      {/* Column rows */}
      <div ref={scrollContainerRef} className='min-h-0 flex-1 overflow-y-auto'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {columns.map((col) => (
              <ColumnRow
                key={col.id}
                column={col}
                allColumns={columns}
                canEdit={canEdit}
                onChangeName={handleChangeName}
                onChangeType={handleChangeType}
                onChangeRequired={handleChangeRequired}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>

        {canEdit && (
          <div className='ml-4 pt-3 pl-7'>
            <ColumnTypeDropdown onTypeSelect={handleAddColumn} label='Columns' />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetBlueprintEditor;
