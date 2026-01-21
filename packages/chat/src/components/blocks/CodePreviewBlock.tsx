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
    <div className={cn('space-y-2', className)}>
      <span className='text-GRAY_700 f-11-500 tracking-wide uppercase'>{label}</span>
      <div
        className={cn(
          'overflow-x-auto rounded-lg border p-3',
          isError ? 'border-red-200 bg-red-50' : 'border-GRAY_200 bg-gray-50',
        )}
      >
        <pre className={cn('f-12-400 break-all whitespace-pre-wrap', isError ? 'text-red-700' : 'text-GRAY_700')}>
          {formatJson(content)}
        </pre>
      </div>
    </div>
  );
};
