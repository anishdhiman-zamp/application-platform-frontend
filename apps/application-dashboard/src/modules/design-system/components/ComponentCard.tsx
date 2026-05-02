'use client';

import { CopyToClipboard } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Copy } from 'lucide-react';
import type { ComponentEntryType } from 'modules/design-system/types/design-system.types';

interface ComponentCardProps {
  entry: ComponentEntryType;
}

const ComponentCard = ({ entry }: ComponentCardProps) => {
  if (!entry) return null;

  return (
    <div className='border-GRAY_300 bg-BG_WHITE flex flex-col gap-4 rounded-lg border p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h3 className='text-GRAY_1000 text-sm font-semibold'>{entry.name}</h3>
          {entry.description && <p className='text-GRAY_700 text-xs'>{entry.description}</p>}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
            entry.renderable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
          )}
        >
          {entry.renderable ? 'live' : 'context required'}
        </span>
      </div>

      <div className='border-GRAY_200 bg-GRAY_50 flex min-h-24 flex-wrap items-center gap-3 rounded-md border border-dashed p-4'>
        {entry.renderable && entry.preview ? (
          entry.preview
        ) : (
          <span className='text-GRAY_500 text-xs italic'>
            {entry.renderable
              ? 'No preview defined'
              : 'This component needs context/data — open the source file to inspect.'}
          </span>
        )}
      </div>

      {entry.variantSamples && entry.variantSamples.length > 0 && (
        <div className='flex flex-col gap-2'>
          <div className='text-GRAY_700 text-[11px] font-medium tracking-wide uppercase'>Variants</div>
          <div className='border-GRAY_200 bg-GRAY_50 grid grid-cols-2 gap-3 rounded-md border border-dashed p-4 sm:grid-cols-3'>
            {entry.variantSamples.map((sample) => (
              <div key={sample.label} className='flex flex-col items-start gap-1.5'>
                <span className='text-GRAY_500 text-[10px] tracking-wide uppercase'>{sample.label}</span>
                <div className='flex'>{sample.node}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='border-GRAY_200 flex items-center justify-between gap-2 rounded-md border bg-white px-3 py-2'>
        <code className='text-GRAY_900 truncate font-mono text-xs'>{entry.filePath}</code>
        <CopyToClipboard text={entry.filePath}>
          <span className='text-GRAY_700 hover:text-GRAY_1000 inline-flex items-center gap-1 text-xs'>
            <Copy size={12} />
            Copy
          </span>
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default ComponentCard;
