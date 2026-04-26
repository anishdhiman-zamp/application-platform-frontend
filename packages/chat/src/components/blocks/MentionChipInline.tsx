import { getColorsForExtension, getIconForExtension } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { extensionFromFilename } from '@zamp-platform/utils';
import { type CSSProperties, type ReactNode } from 'react';

import { useChatActions } from '../../context/ChatActionsContext';
import type { ReferenceRef } from '../../types/block.types';
import { MENTION_KIND } from '../mention/constants';
import { resolveSemanticIcon } from '../mention/semanticIcon';
import { resolveChipClickHandler } from '../mention/utils';

/**
 * Render a resolved `@-mention` as a neutral rounded pill with a file-type
 * colored icon glyph. Label line-height inherits from the surrounding
 * paragraph so the chip aligns with regular text. Clickable only when a
 * matching handler is available in ChatActionsContext.
 */
const MentionChipInline = ({ reference }: { reference: ReferenceRef }) => {
  const { onFileOpen, onDatasetOpen } = useChatActions();
  const label = reference.display_label || reference.resource_id;
  const kind = reference.kind;
  const isFile = kind === MENTION_KIND.FILE;
  const extension = isFile ? extensionFromFilename(label) : 'txt';
  const colors = getColorsForExtension(extension);
  const FileIconComponent = isFile ? getIconForExtension(extension) : null;
  const SemanticIcon = isFile ? null : resolveSemanticIcon(reference.icon_hint);
  const click = resolveChipClickHandler(
    {
      kind,
      resource_id: reference.resource_id,
      display_label: label,
      provider_hints: reference.provider_hints,
    },
    { onFileOpen, onDatasetOpen },
  );
  const isClickable = Boolean(click);

  const renderIcon = () => {
    if (isFile && FileIconComponent) {
      return <FileIconComponent weight='regular' className='size-3 shrink-0' style={{ color: colors.primary }} />;
    }
    if (SemanticIcon) {
      return <SemanticIcon className='text-GRAY_700 size-3 shrink-0' strokeWidth={1.5} />;
    }
    return null;
  };
  return (
    <span
      data-kind={kind}
      data-mention-chip
      data-file-icon
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={click ?? undefined}
      style={
        {
          '--file-icon-bg': colors.bg,
          '--file-icon-primary': colors.primary,
          backgroundColor: 'var(--file-icon-bg)',
          borderColor: 'color-mix(in srgb, var(--file-icon-primary) 10%, transparent)',
        } as CSSProperties
      }
      className={cn(
        'text-GRAY_1000 inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border px-2 py-0 align-middle text-[12px] font-medium whitespace-nowrap select-none',
        isClickable && 'cursor-pointer',
      )}
    >
      {renderIcon()}
      <span className='min-w-0 flex-1 truncate'>{label}</span>
    </span>
  );
};

export const renderMentionChip = (ref: ReferenceRef | undefined, key: string): ReactNode => {
  if (!ref) return null;
  return <MentionChipInline key={key} reference={ref} />;
};

export default MentionChipInline;
