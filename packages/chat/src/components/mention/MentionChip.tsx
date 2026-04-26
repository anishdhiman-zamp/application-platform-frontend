'use client';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { getColorsForExtension, getIconForExtension } from '@zamp-platform/ui';
import { X } from 'lucide-react';
import React from 'react';

import { useChatActions } from '../../context/ChatActionsContext';
import { MENTION_KIND } from './constants';
import { resolveSemanticIcon } from './semanticIcon';
import { resolveChipClickHandler } from './utils';

export interface MentionAttrs {
  id: string;
  label: string;
  kind: string;
  iconHint: string;
  providerHints: Record<string, unknown>;
}

export const MentionChip = ({ node, deleteNode }: ReactNodeViewProps) => {
  const attrs = node.attrs as MentionAttrs;
  const label = attrs.label ?? attrs.id ?? '';
  const isFile = attrs.kind === MENTION_KIND.FILE;
  const iconHint = isFile ? (attrs.iconHint ?? '') : 'txt';
  const colors = getColorsForExtension(iconHint);
  const FileIconComponent = isFile ? getIconForExtension(iconHint) : null;
  const SemanticIcon = isFile ? null : resolveSemanticIcon(attrs.iconHint);
  const { onFileOpen, onDatasetOpen } = useChatActions();
  const handleClick = resolveChipClickHandler(
    {
      kind: attrs.kind,
      resource_id: attrs.id,
      display_label: attrs.label,
      provider_hints: attrs.providerHints ?? {},
    },
    { onFileOpen, onDatasetOpen },
  );
  const isClickable = Boolean(handleClick);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteNode();
  };

  return (
    <NodeViewWrapper as='span' data-kind={attrs.kind} data-resource-id={attrs.id ?? ''}>
      <span
        data-kind={attrs.kind}
        data-file-icon
        data-clickable={isClickable ? 'true' : undefined}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={handleClick ?? undefined}
        className='mention-inline'
        style={
          {
            '--file-icon-bg': colors.bg,
            '--file-icon-primary': colors.primary,
          } as React.CSSProperties
        }
      >
        <span className='mention-inline-icon' aria-hidden='true' contentEditable={false}>
          {isFile && FileIconComponent ? (
            <FileIconComponent weight='regular' className='size-3 shrink-0' style={{ color: colors.primary }} />
          ) : SemanticIcon ? (
            <SemanticIcon className='text-GRAY_700 size-3 shrink-0' strokeWidth={1.5} />
          ) : null}
          <button
            type='button'
            className='mention-inline-remove'
            aria-label='Remove mention'
            contentEditable={false}
            onClick={handleRemove}
            onMouseDown={(e) => e.preventDefault()}
          >
            <X className='size-2.5' />
          </button>
        </span>
        <span className='mention-inline-label'>{label}</span>
      </span>
    </NodeViewWrapper>
  );
};
