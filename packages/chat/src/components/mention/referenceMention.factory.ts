'use client';

import Mention from '@tiptap/extension-mention';
import { type Editor, ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { ReferenceKindDescriptor, ReferencePickerAdapter, ReferenceSearchHit } from '../../types/references.types';
import { EXIT_ANIMATION_MS, MENTION_KIND } from './constants';
import { type MentionAttrs, MentionChip } from './MentionChip';
import { MentionPopover, type MentionPopoverHandle } from './MentionPopover';
import { parseKindPrefix, RICH_MENTION_PATTERN, unescapeMentionLabel } from './utils';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type { MentionAttrs } from './MentionChip';
export type { Editor } from '@tiptap/react';

const hitToAttrs = (hit: ReferenceSearchHit): MentionAttrs => ({
  id: hit.resource_id,
  label: hit.display_label,
  kind: hit.kind,
  iconHint: hit.icon_hint ?? '',
  providerHints: hit.provider_hints ?? {},
});

interface FactoryOptions {
  adapter: ReferencePickerAdapter;
  onOpenChange?: (isOpen: boolean) => void;
}

export const createReferenceMention = ({ adapter, onOpenChange }: FactoryOptions) => {
  let aliasToKind: Record<string, string> = {};
  let cachedKinds: ReferenceKindDescriptor[] = [];
  const pendingRenders = new Set<() => void>();
  queueMicrotask(() => {
    adapter
      .listKinds()
      .then((kinds) => {
        const map: Record<string, string> = {};
        for (const k of kinds) {
          map[k.kind.toLowerCase()] = k.kind;
          for (const a of k.aliases ?? []) map[a.toLowerCase()] = k.kind;
        }
        aliasToKind = map;
        cachedKinds = kinds;
        pendingRenders.forEach((fn) => fn());
        pendingRenders.clear();
      })
      .catch(() => {});
  });

  const suggestion = {
    char: '@',
    allowSpaces: false,
    allowedPrefixes: null,
    items: () => [],
    render: () => {
      let popoverEl: HTMLDivElement | null = null;
      let root: Root | null = null;
      const popoverRef = React.createRef<MentionPopoverHandle>();
      let currentQuery = '';
      let currentCommand: ((attrs: MentionAttrs) => void) | null = null;
      let currentEditor: Editor | null = null;
      let isOpen = false;
      let unmountTimer: ReturnType<typeof setTimeout> | null = null;
      let pendingReopen = false;
      let dismissed = false;

      const markDismissed = () => {
        dismissed = true;
      };

      const reopenAfterDismiss = () => {
        dismissed = false;
        if (unmountTimer) {
          clearTimeout(unmountTimer);
          unmountTimer = null;
        }
        mountEl();
        isOpen = true;
        onOpenChange?.(true);
        render();
      };

      const handleOutsideMouseDown = (event: MouseEvent) => {
        if (!popoverEl || dismissed) return;
        const target = event.target as Node | null;
        if (target && popoverEl.contains(target)) return;
        const editorDom = currentEditor?.view?.dom as Node | undefined;
        if (editorDom && target && editorDom.contains(target)) return;
        markDismissed();
        onOpenChange?.(false);
        playExitAndUnmount();
      };

      const handleEditorFocus = () => {
        // Reopen on refocus while a suggestion is still active so the user doesn't have to retype.
        if (!dismissed || !currentCommand) return;
        reopenAfterDismiss();
      };

      const playExitAndUnmount = () => {
        if (!root || !popoverEl) {
          unmount();
          return;
        }
        if (prefersReducedMotion()) {
          unmount();
          return;
        }
        isOpen = false;
        render();
        if (unmountTimer) clearTimeout(unmountTimer);
        unmountTimer = setTimeout(() => {
          unmountTimer = null;
          unmount();
        }, EXIT_ANIMATION_MS);
      };

      const mountEl = () => {
        if (popoverEl) return;
        const editorDom = currentEditor?.view?.dom as HTMLElement | undefined;
        const composerEl =
          editorDom?.closest<HTMLElement>('[data-slot="chat-composer"]') ??
          editorDom?.closest<HTMLElement>('.rich-text-editor-wrapper')?.parentElement;

        // Ensure composer is a positioning context so absolute popover anchors to it.
        if (composerEl && window.getComputedStyle(composerEl).position === 'static') {
          composerEl.style.position = 'relative';
        }

        popoverEl = document.createElement('div');
        // Anchor inside the composer subtree so the popover unmounts with the editor — no leaked DOM, no duplicates.
        popoverEl.style.position = 'absolute';
        popoverEl.style.left = '0';
        popoverEl.style.right = '0';
        popoverEl.style.bottom = 'calc(100% + 6px)';
        popoverEl.style.zIndex = '1003';
        popoverEl.style.pointerEvents = 'auto';

        const container = composerEl ?? document.body;
        container.appendChild(popoverEl);
        root = createRoot(popoverEl);
        document.addEventListener('mousedown', handleOutsideMouseDown, true);
      };

      const unmount = () => {
        const r = root;
        const el = popoverEl;
        root = null;
        popoverEl = null;
        if (unmountTimer) {
          clearTimeout(unmountTimer);
          unmountTimer = null;
        }
        document.removeEventListener('mousedown', handleOutsideMouseDown, true);
        // Keep `currentEditor` alive so the focus listener can reopen post-dismiss; cleared in `onExit`.
        if (r) queueMicrotask(() => r.unmount());
        if (el?.parentNode) el.parentNode.removeChild(el);
      };

      const insertHit = (hit: ReferenceSearchHit, options?: { keepOpen?: boolean }) => {
        if (!currentCommand) return;
        const editor = currentEditor;
        if (options?.keepOpen) {
          pendingReopen = true;
          currentCommand(hitToAttrs(hit));
          editor?.chain().focus().insertContent('@').run();
          return;
        }
        currentCommand(hitToAttrs(hit));
      };

      const render = () => {
        if (!root) return;
        const { kind, query } = parseKindPrefix(currentQuery, aliasToKind);
        root.render(
          React.createElement(MentionPopover, {
            ref: popoverRef,
            open: isOpen,
            adapter,
            kinds: cachedKinds,
            initialKind: kind,
            query,
            onSelect: insertHit,
            onClose: () => {
              markDismissed();
              onOpenChange?.(false);
              playExitAndUnmount();
              currentEditor?.commands.focus();
            },
          }),
        );
      };

      type SuggestionProps = {
        query?: string;
        clientRect?: (() => DOMRect | null) | null;
        command: (attrs: MentionAttrs) => void;
        editor: Editor;
      };

      return {
        onStart: (props: SuggestionProps) => {
          currentQuery = props.query ?? '';
          currentCommand = props.command;
          currentEditor = props.editor;
          currentEditor?.on('focus', handleEditorFocus);
          dismissed = false;
          if (unmountTimer) {
            clearTimeout(unmountTimer);
            unmountTimer = null;
          }
          mountEl();
          if (cachedKinds.length === 0) pendingRenders.add(render);
          onOpenChange?.(true);
          isOpen = true;
          render();
        },
        onUpdate: (props: SuggestionProps) => {
          const nextQuery = props.query ?? '';
          currentCommand = props.command;
          currentEditor = props.editor;
          // Any query change after dismiss means the user is still editing — reopen.
          if (dismissed && nextQuery !== currentQuery) {
            currentQuery = nextQuery;
            reopenAfterDismiss();
            return;
          }
          currentQuery = nextQuery;
          if (!dismissed) render();
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (dismissed) return false;
          return popoverRef.current?.onKeyDown(props.event) ?? false;
        },
        onExit: () => {
          currentEditor?.off('focus', handleEditorFocus);
          currentCommand = null;
          currentEditor = null;
          pendingRenders.delete(render);
          if (pendingReopen) {
            pendingReopen = false;
            return;
          }
          if (dismissed) {
            dismissed = false;
            return;
          }
          onOpenChange?.(false);
          playExitAndUnmount();
        },
      };
    },
  };

  return Mention.extend({
    name: 'referenceMention',
    markdownTokenName: 'referenceMention',
    // Rich form so chips round-trip through draft storage; stripped at submit.
    renderMarkdown: (node: { attrs?: Record<string, unknown> }) => {
      const attrs = node.attrs ?? {};
      const rawLabel = (attrs.label as string) ?? (attrs.id as string) ?? '';
      const kind = (attrs.kind as string) ?? MENTION_KIND.FILE;
      const id = (attrs.id as string) ?? '';
      const iconHint = (attrs.iconHint as string) ?? '';
      const hints = attrs.providerHints as Record<string, unknown> | undefined;
      const params = new URLSearchParams();
      if (iconHint) params.set('icon', iconHint);
      if (hints && Object.keys(hints).length > 0) params.set('hints', JSON.stringify(hints));
      const queryString = params.toString();
      const query = queryString ? `?${queryString}` : '';
      // Escape `\` and `]` so labels like `report [draft].pdf` don't close the `[...]` segment.
      const label = rawLabel.replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
      // Encode `(` and `)` explicitly — encodeURIComponent leaves them literal, but they delimit `(...)`.
      const encodedId = encodeURIComponent(id).replace(/\(/g, '%28').replace(/\)/g, '%29');
      const markdown = `@[${label}](mention://${kind}/${encodedId}${query})`;
      return markdown;
    },
    markdownTokenizer: {
      name: 'referenceMention',
      level: 'inline',
      // '@[' prefix wins ordering against the standard link parser.
      start: (src: string) => {
        const idx = src.indexOf('@[');
        return idx === -1 ? -1 : idx;
      },
      tokenize: (src: string) => {
        const pattern = new RegExp(RICH_MENTION_PATTERN.source);
        const match = pattern.exec(src);
        if (!match || match.index !== 0) return undefined;
        const [raw, rawLabel, kind, idEncoded, queryString] = match;
        const label = unescapeMentionLabel(rawLabel);
        let providerHints: Record<string, unknown> = {};
        let iconHint = '';
        if (queryString) {
          const params = new URLSearchParams(queryString);
          iconHint = params.get('icon') ?? '';
          const hintsRaw = params.get('hints');
          if (hintsRaw) {
            try {
              providerHints = JSON.parse(hintsRaw);
            } catch {
              providerHints = {};
            }
          }
        }
        let id = idEncoded;
        try {
          id = decodeURIComponent(idEncoded);
        } catch {
          // keep the raw value
        }
        return {
          type: 'referenceMention',
          raw,
          label,
          kind,
          id,
          iconHint,
          providerHints,
        };
      },
    },
    parseMarkdown: (token) => ({
      type: 'referenceMention',
      attrs: {
        id: (token as { id?: string }).id ?? '',
        label: (token as { label?: string }).label ?? '',
        kind: (token as { kind?: string }).kind ?? MENTION_KIND.FILE,
        iconHint: (token as { iconHint?: string }).iconHint ?? '',
        providerHints: (token as { providerHints?: Record<string, unknown> }).providerHints ?? {},
      },
    }),
    addNodeView() {
      return ReactNodeViewRenderer(MentionChip) as never;
    },
    addAttributes() {
      return {
        id: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-id') ?? element.getAttribute('data-resource-id'),
          renderHTML: (attrs) => {
            const id = (attrs as MentionAttrs).id;
            return id ? { 'data-id': id, 'data-resource-id': id } : {};
          },
        },
        label: {
          default: null,
          parseHTML: (element) =>
            element.getAttribute('data-label') ?? element.querySelector('.mention-inline-label')?.textContent ?? null,
          renderHTML: (attrs) => {
            const label = (attrs as MentionAttrs).label;
            return label ? { 'data-label': label } : {};
          },
        },
        kind: {
          default: MENTION_KIND.FILE,
          parseHTML: (element) => element.getAttribute('data-kind') ?? MENTION_KIND.FILE,
          renderHTML: (attrs) => ({ 'data-kind': (attrs as MentionAttrs).kind }),
        },
        iconHint: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-icon-hint') ?? '',
          renderHTML: (attrs) => {
            const hint = (attrs as MentionAttrs).iconHint;
            return hint ? { 'data-icon-hint': hint } : {};
          },
        },
        providerHints: {
          default: {},
          parseHTML: (element) => {
            const raw = element.getAttribute('data-provider-hints');
            if (!raw) return {};
            try {
              return JSON.parse(raw);
            } catch {
              return {};
            }
          },
          renderHTML: (attrs) => {
            const hints = (attrs as MentionAttrs).providerHints;
            if (!hints || Object.keys(hints).length === 0) return {};
            return { 'data-provider-hints': JSON.stringify(hints) };
          },
        },
      };
    },
  }).configure({
    HTMLAttributes: { class: 'mention-inline' },
    renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id ?? ''}`,
    renderHTML: ({ options, node }) => {
      const label = (node.attrs.label as string) ?? (node.attrs.id as string) ?? '';
      return [
        'span',
        {
          ...options.HTMLAttributes,
          // data-type matches the parent Mention extension's parseHTML selector on paste.
          'data-type': 'referenceMention',
          class: 'mention-inline',
          'data-kind': node.attrs.kind,
          'data-id': node.attrs.id,
          'data-resource-id': node.attrs.id,
          'data-label': label,
        },
        ['span', { class: 'mention-inline-icon', 'aria-hidden': 'true' }, ''],
        ['span', { class: 'mention-inline-label' }, label],
      ];
    },
    deleteTriggerWithBackspace: true,
    suggestion: suggestion as never,
  });
};

export { extractChipsFromEditor, stripMentionMarkdown } from './utils';
