'use client';

import { type FC, useEffect, useMemo } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from '@zamp-platform/ui';
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
    return <Skeleton className='h-5 w-20 rounded' />;
  }

  if (models.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='small'
          className={cn(
            'f-11-500 text-GRAY_600 hover:text-GRAY_900 flex items-center gap-1 px-1.5 focus-visible:ring-0 focus-visible:ring-offset-0',
            className,
          )}
        >
          {selectedModel?.display_name ?? 'Select model'}
          <ChevronDown size={10} className='shrink-0' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='max-h-[320px] w-[220px] overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      >
        {models.map((model: ChatModelOption) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onChange(model.id)}
            className='hover:bg-GRAY_100 flex cursor-pointer items-start gap-2 rounded-md px-3 py-2 outline-none'
          >
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span className='f-12-500 text-GRAY_1000'>{model.display_name}</span>
              {model.description && <span className='f-11-400 text-GRAY_600 leading-tight'>{model.description}</span>}
            </div>
            {model.id === selectedId && <Check size={13} className='text-GRAY_1000 mt-0.5 shrink-0' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
