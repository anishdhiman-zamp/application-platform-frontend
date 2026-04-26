'use client';

import Mention from '@tiptap/extension-mention';
import { type Editor, ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { ReferenceKindDescriptor, ReferencePickerAdapter, ReferenceSearchHit } from '../../types/references.types';
import { EXIT_ANIMATION_MS, MENTION_KIND } from './constants';
import { type MentionAttrs, MentionChip } from './MentionChip';
import { MentionPopover, type MentionPopoverHandle } from './MentionPopover';
import { parseKindPrefix } from './utils';

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

      const handleOutsideMouseDown = (event: MouseEvent) => {
        if (!popoverEl || dismissed) return;
        const target = event.target as Node | null;
        if (target && popoverEl.contains(target)) return;
        const editorDom = currentEditor?.view?.dom as Node | undefined;
        if (editorDom && target && editorDom.contains(target)) return;
        dismissed = true;
        onOpenChange?.(false);
        playExitAndUnmount();
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
        // Anchor popover inside the composer subtree. When the composer unmounts
        // (route change, conversation switch, refresh), the popover goes with it —
        // no leaked DOM on other pages, no duplicate popovers across editor
        // instances. Absolute positioning against composer = 1 popover per editor
        // by DOM ownership.
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
        currentEditor = null;
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
              dismissed = true;
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
          if (dismissed) return;
          currentQuery = props.query ?? '';
          currentCommand = props.command;
          currentEditor = props.editor;
          render();
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (dismissed) return false;
          return popoverRef.current?.onKeyDown(props.event) ?? false;
        },
        onExit: () => {
          currentCommand = null;
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
    renderMarkdown: (node: { attrs?: Record<string, unknown> }) => {
      const label = (node.attrs?.label as string) ?? (node.attrs?.id as string) ?? '';
      return `@${label}`;
    },
    addNodeView() {
      return ReactNodeViewRenderer(MentionChip) as never;
    },
    addAttributes() {
      return {
        id: { default: null },
        label: { default: null },
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
          class: 'mention-inline',
          'data-kind': node.attrs.kind,
          'data-resource-id': node.attrs.id,
        },
        ['span', { class: 'mention-inline-icon', 'aria-hidden': 'true' }, ''],
        ['span', { class: 'mention-inline-label' }, label],
      ];
    },
    deleteTriggerWithBackspace: true,
    suggestion: suggestion as never,
  });
};

export { extractChipsFromEditor } from './utils';
