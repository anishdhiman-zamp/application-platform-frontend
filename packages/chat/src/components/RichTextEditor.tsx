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
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

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
    const lastEditorMarkdown = useRef(value || '');
    const onSubmitRef = useRef(onSubmit);
    const isSubmitDisabledRef = useRef(isSubmitDisabled);
    const onPasteRef = useRef(onPaste);

    onSubmitRef.current = onSubmit;
    isSubmitDisabledRef.current = isSubmitDisabled;
    onPasteRef.current = onPaste;

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
        }),
        Markdown,
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
              onSubmitRef.current();
              return true;
            }
          }

          return false;
        },
        handlePaste: (_view, event) => {
          if (onPasteRef.current) {
            const hasFiles = (event.clipboardData?.files?.length ?? 0) > 0;
            onPasteRef.current(event as unknown as React.ClipboardEvent<HTMLTextAreaElement>);
            if (hasFiles) return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor: ed }) => {
        const md = ed.getMarkdown().replace(/(\s|&nbsp;|\u00A0)+$/, '');
        lastEditorMarkdown.current = md;
        onChange(md);
      },
    });
    editorRef.current = editor;

    useImperativeHandle(ref, () => ({
      focus: () => editor?.commands.focus(),
      clear: () => {
        lastEditorMarkdown.current = '';
        editor?.commands.clearContent(true);
      },
    }));

    useEffect(() => {
      if (!editor) return;

      if (value === lastEditorMarkdown.current) return;

      if (!value) {
        lastEditorMarkdown.current = '';
        editor.commands.clearContent(false);
      } else {
        lastEditorMarkdown.current = value;
        editor.commands.setContent(value, { contentType: 'markdown' });
      }
    }, [value, editor]);

    if (!editor) return null;

    return (
      <div
        className='rich-text-editor-wrapper'
        style={{
          ...(minHeight != null && { minHeight: `${minHeight}px` }),
          maxHeight: `${maxHeight}px`,
          overflowY: 'auto',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';
