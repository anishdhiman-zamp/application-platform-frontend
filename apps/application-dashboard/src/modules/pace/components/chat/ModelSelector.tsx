'use client';

import { type FC, useMemo } from 'react';
import { Button, Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Check, ChevronDown } from 'lucide-react';
import { type ChatModelOption, useListChatModelsQuery } from '@/apis/pace';
import { useIsPaceChatEnabled } from '@/hooks/useIsPaceChatEnabled';

interface ModelSelectorProps {
  value: string | null;
  onChange: (modelId: string) => void;
  className?: string;
}

const ModelSelector: FC<ModelSelectorProps> = ({ value, onChange, className }) => {
  const { isPaceChatEnabled } = useIsPaceChatEnabled();
  const { data, isLoading } = useListChatModelsQuery(undefined, { skip: !isPaceChatEnabled });

  const models = data?.models ?? [];
  const defaultModel = useMemo(() => models.find((m) => m.is_default), [models]);
  const selectedId = value ?? defaultModel?.id ?? null;
  const selectedModel = useMemo(() => models.find((m) => m.id === selectedId), [models, selectedId]);

  if (!isPaceChatEnabled || isLoading || models.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
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
            <button
              key={model.id}
              onClick={() => onChange(model.id)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors',
                'hover:bg-gray-50',
                model.id === selectedId && 'bg-gray-50',
              )}
            >
              <div className='flex flex-col gap-0.5'>
                <span className='f-13-500 text-GRAY_1000'>{model.display_name}</span>
                <span className='f-11-400 text-GRAY_600'>{model.description}</span>
              </div>
              {model.id === selectedId && <Check size={14} className='ml-2 shrink-0 text-blue-500' />}
            </button>
          ))}
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export default ModelSelector;
