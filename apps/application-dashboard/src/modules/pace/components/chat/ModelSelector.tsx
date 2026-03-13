'use client';

import { type FC, useEffect, useMemo } from 'react';
import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger, Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, ChevronDown } from 'lucide-react';
import { type ChatModelOption, useListChatModelsQuery } from '@/apis/pace';

interface ModelSelectorProps {
  value: string | null;
  onChange: (modelId: string) => void;
  className?: string;
}

const ModelSelector: FC<ModelSelectorProps> = ({ value, onChange, className }) => {
  const { data, isLoading } = useListChatModelsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const models = data?.models ?? [];
  const defaultModel = useMemo(() => models.find((m) => m.is_default), [models]);
  const selectedId = value ?? defaultModel?.id ?? null;
  const selectedModel = useMemo(() => models.find((m) => m.id === selectedId), [models, selectedId]);

  useEffect(() => {
    if (value === null && defaultModel) {
      onChange(defaultModel.id);
    }
  }, [value, defaultModel, onChange]);

  if (isLoading) {
    return <Skeleton className='h-5 w-16 rounded' />;
  }

  if (models.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='small'
          className={cn(
            'f-11-500 text-GRAY_600 hover:text-GRAY_900 flex h-5 items-center gap-0.5 rounded px-1.5',
            className,
          )}
        >
          {selectedModel?.display_name ?? 'Select model'}
          <ChevronDown size={10} />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent align='end' className='max-h-[340px] w-[240px] overflow-y-auto p-1'>
          {models.map((model: ChatModelOption) => (
            <Button
              key={model.id}
              variant='ghost'
              onClick={() => onChange(model.id)}
              className={cn(
                'flex h-auto w-full items-center justify-between rounded-md px-3 py-2.5 text-left',
                model.id === selectedId && 'bg-gray-50',
              )}
            >
              <div className='flex flex-col gap-0.5'>
                <span className='f-13-500 text-GRAY_1000'>{model.display_name}</span>
                <span className='f-11-400 text-GRAY_600'>{model.description}</span>
              </div>
              {model.id === selectedId && <Check size={14} className='text-GRAY_1000 ml-2 shrink-0' />}
            </Button>
          ))}
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default ModelSelector;
