'use client';

import { cn } from '@zamp-platform/ui/utils';
import React, { FC } from 'react';

import { formatJson } from '../block.utils';

interface CodePreviewBlockProps {
  label: string;
  content: string | undefined;
  isError?: boolean;
  className?: string;
}

/**
 * A reusable component for displaying formatted JSON/code content with a label.
 * Used in tool call blocks for displaying input parameters and output results.
 */
export const CodePreviewBlock: FC<CodePreviewBlockProps> = ({ label, content, isError = false, className }) => {
  if (!content) return null;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className='text-GRAY_900 f-12-450 tracking-wide'>{label}</div>
      <div
        className={cn(
          'overflow-x-auto rounded-lg border p-3',
          isError ? 'border-destructive/30 bg-destructive/10' : 'border-GRAY_400 bg-BG_GRAY_2',
        )}
      >
        <pre className={cn('f-12-400 break-all whitespace-pre-wrap', isError ? 'text-RED_700' : 'text-GRAY_900')}>
          {formatJson(content)}
        </pre>
      </div>
    </div>
  );
};
