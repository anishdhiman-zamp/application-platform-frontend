import type { Editor } from '@tiptap/react';

import type { ChatActionsContextType } from '../../context/ChatActionsContext';
import type { ReferenceChip, ReferenceSearchHit } from '../../types/references.types';
import { normalizeFilesystemPath } from '../../utils/filesystemUpload';
import { MENTION_KIND, TAB_STYLES } from './constants';
import type { MentionAttrs } from './MentionChip';

/** Stable React list key for a reference hit, scoped by kind to avoid collisions. */
export const hitKey = (hit: ReferenceSearchHit) => `${hit.kind}:${hit.resource_id}`;

interface ChipRef {
  kind: string;
  resource_id: string;
  display_label: string;
  provider_hints?: Record<string, unknown>;
}

/**
 * Resolve a click handler for a mention chip based on its kind and the
 * handlers available in ChatActionsContext. Returns `null` when no handler
 * is available — callers should render the chip as non-interactive.
 */
export const resolveChipClickHandler = (
  ref: ChipRef,
  actions: Pick<ChatActionsContextType, 'onFileOpen' | 'onDatasetOpen'>,
): (() => void) | null => {
  const label = ref.display_label || ref.resource_id;
  if (ref.kind === MENTION_KIND.FILE && actions.onFileOpen) {
    return () => {
      const rawPath = (ref.provider_hints?.path as string | undefined) ?? ref.resource_id;
      actions.onFileOpen!(normalizeFilesystemPath(rawPath), label);
    };
  }
  if (ref.kind === MENTION_KIND.DATASET && actions.onDatasetOpen) {
    return () => actions.onDatasetOpen!(ref.resource_id, label);
  }
  return null;
};

/**
 * Parse a `kind:query` prefix from a mention input.
 * Returns the resolved kind (via the alias map) and the remaining query.
 * When no known kind is matched, returns `{ kind: null, query: input }`.
 */
export const parseKindPrefix = (
  input: string,
  aliasToKind: Record<string, string>,
): { kind: string | null; query: string } => {
  const match = input.match(/^([A-Za-z][A-Za-z0-9_-]*):(.*)$/);
  if (!match) return { kind: null, query: input };
  const alias = match[1].toLowerCase();
  const kind = aliasToKind[alias];
  if (!kind) return { kind: null, query: input };
  return { kind, query: match[2] };
};

/**
 * Resolve the Tailwind class string for a mention tab given its variant and selection state.
 *
 * @param isRecent - `true` for the @-pill recent tab, `false` for per-kind pills.
 * @param isActive - `true` when the tab is currently selected.
 */
export const getTabStyle = (isRecent: boolean, isActive: boolean): string => {
  const key = `${isRecent ? 'recent' : 'kind'}-${isActive ? 'active' : 'inactive'}` as keyof typeof TAB_STYLES;
  return TAB_STYLES[key];
};

/**
 * Walk an editor's doc and collect chip payloads for submit.
 *
 * Each chip carries its `text_range` — the [start, end) offsets of the
 * corresponding `@label` token in the markdown text that will be sent.
 *
 * Offsets are found by searching the actual serialized markdown (same string
 * the onUpdate handler produces & ships to the backend) for each chip's
 * `@label` in doc order. This sidesteps predicting block-separator widths for
 * paragraphs, headings, lists, code blocks, empty blocks etc. — whatever
 * tiptap serializes is what we index against.
 */
export const extractChipsFromEditor = (editor: Editor | null): (ReferenceChip & { text_range: [number, number] })[] => {
  if (!editor) return [];

  const getMarkdown = (editor as unknown as { getMarkdown?: () => string }).getMarkdown?.bind(editor);
  const rawMarkdown = getMarkdown?.() ?? editor.getText();
  const markdown = rawMarkdown
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+$/, '');

  const chips: (ReferenceChip & { text_range: [number, number] })[] = [];
  let cursor = 0;

  editor.state.doc.descendants((node) => {
    if (node.type.name !== 'referenceMention') return true;
    const attrs = node.attrs as MentionAttrs;
    const label = attrs.label ?? attrs.id ?? '';
    const token = `@${label}`;
    const start = markdown.indexOf(token, cursor);
    if (start === -1) return false;
    const end = start + token.length;
    chips.push({
      kind: attrs.kind,
      resource_id: attrs.id,
      display_label: label,
      provider_hints: attrs.providerHints ?? {},
      text_range: [start, end],
    });
    cursor = end;
    return false;
  });

  return chips;
};
