'use client';

import { FileIcon } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

import type { ReferenceSearchHit } from '../../types/references.types';
import { MENTION_KIND } from './constants';
import { resolveSemanticIcon } from './semanticIcon';

interface MentionResultRowProps {
  item: ReferenceSearchHit;
  idx: number;
  isActive: boolean;
  onMouseDown: (e: React.MouseEvent, hit: ReferenceSearchHit) => void;
  onMouseEnter: (idx: number) => void;
}

export const MentionResultRow = ({ item, idx, isActive, onMouseDown, onMouseEnter }: MentionResultRowProps) => {
  const isFile = item.kind === MENTION_KIND.FILE;
  const SemanticIcon = isFile ? null : resolveSemanticIcon(item.icon_hint);

  return (
    <button
      type='button'
      data-idx={idx}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-[6px] p-2 text-left',
        isActive ? 'bg-GRAY_100' : 'hover:bg-GRAY_100',
      )}
      onMouseDown={(e) => onMouseDown(e, item)}
      onMouseEnter={() => onMouseEnter(idx)}
    >
      {isFile ? (
        <FileIcon
          extension={item.icon_hint ?? ''}
          className='size-3.5 shrink-0 !bg-transparent'
          iconClassName='size-3.5'
        />
      ) : SemanticIcon ? (
        <SemanticIcon className='text-GRAY_700 size-3.5 shrink-0' />
      ) : null}
      <span className='text-GRAY_1000 f-13-500 shrink-0 truncate'>{item.display_label}</span>
      {item.secondary_label && (
        <span className='text-GRAY_600 ml-auto truncate pl-2 text-xs'>{item.secondary_label}</span>
      )}
    </button>
  );
};

export const EmptyRow = ({ label, loading }: { label: string; loading?: boolean }) => (
  <div className='text-GRAY_600 flex items-center gap-2 px-2 py-2 text-sm'>
    {loading ? <Loader2 className='size-3.5 animate-spin' /> : null}
    <span>{label}</span>
  </div>
);
