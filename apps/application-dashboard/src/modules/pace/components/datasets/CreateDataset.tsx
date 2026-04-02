'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DatasetColumnTypes } from '@zamp-platform/dataset-create-edit';
import { Button, toast, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
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

const CreateDataset = () => {
  const router = useRouter();
  const [title, setTitle] = useState('Untitled Dataset');
  const [isEditingTitle, setIsEditingTitle] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [columns, setColumns] = useState<BlueprintColumn[]>(() => [createDefaultColumn(DatasetColumnTypes.TEXT, 1)]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

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
      if (/[^a-zA-Z0-9 ]/.test(n)) return 'Column name can only contain alphabets, numbers, and spaces';
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
      router.push(preserveSidebarParam(getDatasetDetailRoute(tableName)));
    } catch {
      toast.error('Failed to create dataset');
    }
  }, [validate, title, columns, executeMutation, router]);

  const handleTitleClick = useCallback(() => {
    setIsEditingTitle(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
  }, []);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
  }, []);

  const displayTitle = title.trim() || 'Untitled Dataset';

  return (
    <div className='bg-BG_WHITE flex h-full w-full flex-1 flex-col'>
      {/* Header */}
      <div className='border-GRAY_400 flex items-center gap-3 border-b px-10 pt-10 pb-8'>
        <Link href={preserveSidebarParam(ROUTES_PATH.CHAT_SETTINGS_DATASETS)}>
          <ArrowLeft width={18} height={18} className='text-GRAY_700 hover:text-GRAY_1000 transition-colors' />
        </Link>
        {isEditingTitle ? (
          <input
            ref={inputRef}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            placeholder='Untitled Dataset'
            className='f-18-600 text-GRAY_1000 h-auto flex-1 border-none bg-transparent px-0 py-0 shadow-none outline-none'
          />
        ) : (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={handleTitleClick}
                  className='f-18-600 text-GRAY_1000 cursor-pointer truncate text-left'
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
