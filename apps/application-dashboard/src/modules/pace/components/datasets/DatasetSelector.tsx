'use client';

import { useCallback, useMemo, useState } from 'react';
import { Input, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Database, Search } from 'lucide-react';
import { DATASETS_POLL_INTERVAL_MS, LIST_TABLES_QUERY } from 'modules/pace/components/datasets/datasets.constants';
import { snakeCaseToSentenceCase } from 'utils/common';
import { type AgentDbQueryRequest, useAgentDbReadQuery } from '@/apis/agentManagedDb';

interface DatasetSelectorProps {
  tableName: string;
  onSelectDataset: (tableName: string, displayName: string) => void;
}

const LISTING_QUERY_ARG: AgentDbQueryRequest = { query: LIST_TABLES_QUERY };

const DatasetSelector = ({ tableName, onSelectDataset }: DatasetSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data } = useAgentDbReadQuery(LISTING_QUERY_ARG, {
    pollingInterval: DATASETS_POLL_INTERVAL_MS,
    skipPollingIfUnfocused: true,
  });

  const datasets = useMemo(() => {
    if (!data?.rows) return [];

    return data.rows.map((row) => ({
      id: row.table_name as string,
      title: row.table_name ? snakeCaseToSentenceCase(row.table_name as string) : '',
    }));
  }, [data]);

  const filteredDatasets = useMemo(() => {
    if (!searchQuery.trim()) return datasets;

    const query = searchQuery.toLowerCase();

    return datasets.filter(
      (dataset) => dataset.id.toLowerCase().includes(query) || dataset.title.toLowerCase().includes(query),
    );
  }, [datasets, searchQuery]);

  const displayTitle = snakeCaseToSentenceCase(tableName);

  const handleSelect = useCallback(
    (datasetId: string, datasetTitle: string) => {
      setIsOpen(false);
      setSearchQuery('');
      onSelectDataset(datasetId, datasetTitle);
    },
    [onSelectDataset],
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className='hover:bg-GRAY_100 -ml-1 flex h-7 max-w-full cursor-pointer items-center gap-x-2 rounded-md px-1 transition-colors'>
        <Database size={14} className='text-GRAY_700 shrink-0' />
        <span className='relative block min-w-0 overflow-hidden'>
          <AnimatePresence mode='wait' initial={false}>
            <motion.span
              key={displayTitle}
              className='f-14-550 block truncate first-letter:uppercase'
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.1, ease: 'easeIn' } }}
            >
              {displayTitle}
            </motion.span>
          </AnimatePresence>
        </span>
        <ChevronDown size={14} className={cn('text-GRAY_1000 shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </PopoverTrigger>
      <PopoverContent align='start' sideOffset={8} className='flex h-80 w-72 flex-col overflow-hidden p-0'>
        <div className='border-GRAY_400 flex items-center gap-2 border-b px-3 py-2'>
          <Search size={14} className='text-GRAY_600 shrink-0' />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search datasets...'
            className='h-7 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0'
            autoFocus
          />
        </div>
        <div className='flex-1 overflow-y-auto'>
          {filteredDatasets.length === 0 && (
            <div className='text-GRAY_600 f-12-400 flex items-center justify-center py-6'>No datasets found</div>
          )}
          {filteredDatasets.map((dataset) => (
            <button
              key={dataset.id}
              type='button'
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
                dataset.id === tableName ? 'bg-GRAY_100' : 'hover:bg-GRAY_50',
              )}
              onClick={() => handleSelect(dataset.id, dataset.title)}
            >
              <Database size={14} className='text-GRAY_700 shrink-0' />
              <span className='f-13-400 truncate'>{dataset.title}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatasetSelector;
