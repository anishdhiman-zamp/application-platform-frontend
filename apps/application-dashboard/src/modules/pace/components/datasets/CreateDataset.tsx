'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DatasetColumnTypes } from '@zamp-platform/dataset-create-edit';
import { Button, Input, toast, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft } from 'lucide-react';
import DatasetBlueprintEditor, { createDefaultColumn } from 'modules/pace/components/datasets/DatasetBlueprintEditor';
import {
  type BlueprintColumn,
  buildCreateTableQuery,
  LIST_TABLES_QUERY,
  sanitizeTableName,
} from 'modules/pace/components/datasets/datasets.constants';
import { preserveSidebarParam } from 'modules/pace/pace.utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAgentDbReadQuery, useAgentDbWriteMutation } from '@/apis/agentManagedDb';
import { getDatasetDetailRoute, ROUTES_PATH } from '@/constants/routeConfig';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

interface CreateDatasetProps {
  onCreated?: (tableName: string, displayName: string) => void;
  onTitleChange?: (displayName: string) => void;
  hideBackButton?: boolean;
}

const CreateDataset = ({ onCreated, onTitleChange, hideBackButton }: CreateDatasetProps) => {
  const router = useRouter();
  const [title, setTitle] = useState('Untitled Dataset');
  const [isEditingTitle, setIsEditingTitle] = useState(true);
  const inputElRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useCallback((el: HTMLInputElement | null) => {
    inputElRef.current = el;
  }, []);
  const [columns, setColumns] = useState<BlueprintColumn[]>(() => [createDefaultColumn(DatasetColumnTypes.TEXT, 1)]);

  const { data: tablesData } = useAgentDbReadQuery({ query: LIST_TABLES_QUERY });
  const [executeMutation, { isLoading: isCreating }] = useAgentDbWriteMutation();

  const existingTableNames = useMemo(() => {
    if (!tablesData?.rows) return new Set<string>();

    return new Set(tablesData.rows.map((r) => String(r.table_name).toLowerCase()));
  }, [tablesData]);

  const validate = useCallback((): string | null => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return 'Dataset name cannot be empty';

    const sanitized = sanitizeTableName(trimmedTitle);

    if (existingTableNames.has(sanitized)) return 'Dataset name already exists';

    if (!columns.length) return 'At least one column is required';

    for (const col of columns) {
      const n = col.name.trim();

      if (!n) return 'Column name cannot be empty';
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(n))
        return 'Column name must not contain spaces or special characters, and must not start with a number';
    }

    const names = columns.map((c) => c.name.trim().toLowerCase());

    if (new Set(names).size !== names.length) return 'Column names must be unique';

    return null;
  }, [title, columns, existingTableNames]);

  const handleCreate = useCallback(async () => {
    const error = validate();

    if (error) {
      toast.error(error);

      return;
    }

    const sql = buildCreateTableQuery(title, columns);
    const tableName = sanitizeTableName(title.trim());

    try {
      await executeMutation({ query: sql }).unwrap();
      toast.success('Dataset created successfully');

      if (onCreated) {
        onCreated(tableName, title.trim());
      } else {
        router.push(preserveSidebarParam(getDatasetDetailRoute(tableName)));
      }
    } catch {
      toast.error('Failed to create dataset');
    }
  }, [validate, title, columns, executeMutation, router, onCreated]);

  const handleTitleClick = useCallback(() => {
    setIsEditingTitle(true);
    requestAnimationFrame(() => inputElRef.current?.focus());
  }, []);

  const commitTitle = useCallback(() => {
    setIsEditingTitle(false);
    const trimmed = title.trim() || 'Untitled Dataset';

    onTitleChange?.(trimmed);
  }, [title, onTitleChange]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ENTER) {
        commitTitle();
      }
    },
    [commitTitle],
  );

  const displayTitle = title.trim() || 'Untitled Dataset';

  useEffect(() => {
    if (inputElRef.current) {
      inputElRef.current.focus();
      inputElRef.current.select();
    }
  }, []);

  return (
    <div className='bg-BG_WHITE flex h-full w-full flex-1 flex-col'>
      {/* Header */}
      <div
        className={cn(
          'border-GRAY_400 flex items-center gap-3 border-b',
          hideBackButton ? 'px-4 py-2.5' : 'px-10 pt-10 pb-8',
        )}
      >
        {!hideBackButton && (
          <Link href={preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS)}>
            <ArrowLeft width={18} height={18} className='text-GRAY_700 hover:text-GRAY_1000 transition-colors' />
          </Link>
        )}
        {isEditingTitle ? (
          <Input
            ref={inputRef}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleTitleKeyDown}
            placeholder='Untitled Dataset'
            className='f-18-600 text-GRAY_1000 h-7 flex-1 border-none bg-transparent px-1 shadow-none outline-none'
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={handleTitleClick}
                  className='f-18-600 text-GRAY_1000 h-7 cursor-pointer truncate px-1 text-left'
                >
                  {displayTitle}
                </button>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='f-12-400'>
                Rename
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Blueprint Editor */}
      <div className='flex-1 overflow-hidden'>
        <DatasetBlueprintEditor columns={columns} onChange={setColumns} canEdit />
      </div>

      {/* Footer */}
      <div className='border-GRAY_200 bg-BG_WHITE sticky bottom-0 z-10 flex justify-end border-t p-3'>
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Dataset'}
        </Button>
      </div>
    </div>
  );
};

export default CreateDataset;
