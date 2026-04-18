'use client';

import './code-highlight.css';
import './rich-text-editor.css';

import { Extension } from '@tiptap/core';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { ListItem } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { motion } from 'motion/react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const lowlight = createLowlight(common);

const KEYBOARD_KEYS = {
  ENTER: 'Enter',
} as const;

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onSubmit?: () => void;
  isSubmitDisabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
  maxHeight?: number;
  editorAttributes?: Record<string, string>;
}

export interface RichTextEditorHandle {
  focus: () => void;
  clear: () => void;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (
    {
      value,
      onChange,
      onPaste,
      placeholder = 'Ask anything or give feedback...',
      onSubmit,
      isSubmitDisabled,
      autoFocus = false,
      className,
      style,
      minHeight,
      maxHeight = 200,
      editorAttributes,
    },
    ref,
  ) => {
    const onPasteRef = useRef(onPaste);
    const onSubmitRef = useRef(onSubmit);
    const lastEditorMarkdown = useRef(value || '');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isSubmitDisabledRef = useRef(isSubmitDisabled);
    const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    onSubmitRef.current = onSubmit;
    isSubmitDisabledRef.current = isSubmitDisabled;
    onPasteRef.current = onPaste;

    const [isClearing, setIsClearing] = useState(false);
    const isClearingRef = useRef(false);

    const handleAnimatedSubmitRef = useRef(() => {});
    handleAnimatedSubmitRef.current = () => {
      if (isSubmitDisabledRef.current || !onSubmitRef.current || isClearingRef.current) return;
      isClearingRef.current = true;
      setIsClearing(true);
      clearTimerRef.current = setTimeout(() => {
        onSubmitRef.current?.();
        requestAnimationFrame(() => {
          isClearingRef.current = false;
          setIsClearing(false);
        });
      }, 150);
    };

    useEffect(() => {
      return () => {
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      };
    }, []);

    const editorRef = useRef<ReturnType<typeof useEditor>>(null);

    const editor = useEditor({
      immediatelyRender: true,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
          listItem: false,
          trailingNode: {
            notAfter: ['paragraph', 'bulletList', 'orderedList', 'heading', 'blockquote'],
          },
        }),
        ListItem.extend({
          addKeyboardShortcuts() {
            return {
              ...this.parent?.(),
              Tab: () => this.editor.commands.sinkListItem(this.name),
              'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
            };
          },
        }),
        Extension.create({
          name: 'shiftEnterNewline',
          addKeyboardShortcuts() {
            return {
              'Shift-Enter': () =>
                this.editor.commands.first(({ commands }) => [
                  () => commands.newlineInCode(),
                  () => commands.splitListItem('listItem'),
                  () => commands.createParagraphNear(),
                  () => commands.liftEmptyBlock(),
                  () => commands.splitBlock(),
                ]),
            };
          },
        }),
        CodeBlockLowlight.configure({
          lowlight,
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
          showOnlyCurrent: false,
        }),
        Markdown.configure({
          // remark-gfm (used in MarkdownBlock) requires ≥3 spaces of indentation
          // to recognise nested list items. The default of 2 causes nesting to be
          // flattened when the markdown is rendered.
          indentation: { style: 'space', size: 3 },
        }),
      ],
      content: value || '',
      contentType: 'markdown',
      autofocus: autoFocus,
      editorProps: {
        attributes: {
          class: className || '',
          style: style
            ? Object.entries(style)
                .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
                .join(';')
            : '',
          ...editorAttributes,
        },
        handleKeyDown: (_view, event) => {
          if (event.key === KEYBOARD_KEYS.ENTER && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
            const ed = editorRef.current;
            if (ed?.isActive('bulletList') || ed?.isActive('orderedList') || ed?.isActive('codeBlock')) {
              return false;
            }

            if (!isSubmitDisabledRef.current && onSubmitRef.current) {
              event.preventDefault();
              handleAnimatedSubmitRef.current();
              return true;
            }
          }

          if (event.key === KEYBOARD_KEYS.ENTER && (event.metaKey || event.ctrlKey)) {
            return true;
          }

          return false;
        },
        handlePaste: (view, event) => {
          if (onPasteRef.current) {
            const hasFiles = (event.clipboardData?.files?.length ?? 0) > 0;
            onPasteRef.current(event as unknown as React.ClipboardEvent<HTMLTextAreaElement>);
            if (hasFiles || event.defaultPrevented) return true;
          }

          // Always insert as plain text, normalizing &nbsp; entities and non-breaking
          // spaces so they never appear literally in the editor or the serialized markdown.
          // Using text/plain avoids the @tiptap/markdown extension serializing HTML
          // entity artifacts (URLs with %, =, & can also cause the markdown parser to hang).
          const rawText = event.clipboardData?.getData('text/plain') ?? '';
          if (rawText) {
            event.preventDefault();
            const cleanText = rawText
              .replace(/&nbsp;/gi, ' ')
              .replace(/\u00A0/g, ' ')
              .replace(/\n{2,}/g, '\n');
            const { state, dispatch } = view;
            const { from, to } = state.selection;
            dispatch(state.tr.insertText(cleanText, from, to));
            return true;
          }

          return false;
        },
      },
      onUpdate: ({ editor: ed }) => {
        try {
          const md = ed
            .getMarkdown()
            .replace(/&nbsp;/g, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/\s+$/, '');
          lastEditorMarkdown.current = md;
          onChange(md);
        } catch {
          const fallback = ed.getText().replace(/\u00A0/g, ' ');
          lastEditorMarkdown.current = fallback;
          onChange(fallback);
        }
      },
    });
    editorRef.current = editor;

    useImperativeHandle(ref, () => ({
      focus: () => editor?.commands.focus('end'),
      clear: () => {
        lastEditorMarkdown.current = '';
        editor?.commands.clearContent(true);
      },
    }));

    useEffect(() => {
      if (!editor) return;

      if (value === lastEditorMarkdown.current) return;

      if (!value) {
        const wrapper = wrapperRef.current;
        const oldHeight = wrapper?.offsetHeight ?? 0;

        lastEditorMarkdown.current = '';
        editor.commands.clearContent(false);

        const newHeight = wrapper?.offsetHeight ?? 0;

        if (wrapper && oldHeight !== newHeight) {
          wrapper.style.height = `${newHeight}px`;
          const anim = wrapper.animate([{ height: `${oldHeight}px` }, { height: `${newHeight}px` }], {
            duration: 200,
            easing: 'ease-in-out',
          });
          anim.onfinish = () => {
            wrapper.style.height = '';
          };
        }
      } else {
        lastEditorMarkdown.current = value;
        editor.commands.setContent(value, { contentType: 'markdown' });
      }
    }, [value, editor]);

    if (!editor) return null;

    return (
      <div
        ref={wrapperRef}
        className='rich-text-editor-wrapper'
        style={{
          ...(minHeight != null && { minHeight: `${minHeight}px` }),
          maxHeight: `${maxHeight}px`,
        }}
      >
        <motion.div
          initial={false}
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                opacity: { duration: 0.25, ease: 'easeInOut', delay: 0.2 },
                y: { duration: 0 },
              },
            },
            clearing: {
              opacity: 0,
              y: -30,
              transition: {
                opacity: { duration: 0.15, ease: 'easeOut' },
                y: { duration: 0.15, ease: [0.3, 0.0, 1.0, 1.0] },
              },
            },
          }}
          animate={isClearing ? 'clearing' : 'visible'}
        >
          <EditorContent editor={editor} />
        </motion.div>
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';
