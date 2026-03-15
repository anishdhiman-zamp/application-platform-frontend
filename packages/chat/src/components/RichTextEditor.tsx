'use client';

import './code-highlight.css';
import './rich-text-editor.css';

import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
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

const TIPTAP_NODE_TYPES = {
  LIST_ITEM: 'listItem',
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

    const editor = useEditor({
      immediatelyRender: true,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
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
        },
        handleKeyDown: (view, event) => {
          if (event.key === KEYBOARD_KEYS.ENTER && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
            if (!isSubmitDisabledRef.current && onSubmitRef.current) {
              event.preventDefault();
              onSubmitRef.current();
              return true;
            }
          }

          if (event.key === KEYBOARD_KEYS.ENTER && event.shiftKey) {
            const ed = view.state;
            const { $from } = ed.selection;
            const isInList = $from.node(-1)?.type.name === TIPTAP_NODE_TYPES.LIST_ITEM;

            if (isInList) {
              event.preventDefault();
              editor?.commands.splitListItem(TIPTAP_NODE_TYPES.LIST_ITEM);
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
        const md = ed.getMarkdown();
        lastEditorMarkdown.current = md;
        onChange(md);
      },
    });

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
