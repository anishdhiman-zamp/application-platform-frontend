'use client';

import './code-highlight.css';
import './rich-text-editor.css';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Markdown } from 'tiptap-markdown';

const lowlight = createLowlight(common);

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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
    const isInternalUpdate = useRef(false);
    const onSubmitRef = useRef(onSubmit);
    const isSubmitDisabledRef = useRef(isSubmitDisabled);

    onSubmitRef.current = onSubmit;
    isSubmitDisabledRef.current = isSubmitDisabled;

    const editor = useEditor({
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
        Markdown.configure({
          html: false,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: value || '',
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
        handleKeyDown: (_view, event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
            if (!isSubmitDisabledRef.current && onSubmitRef.current) {
              event.preventDefault();
              onSubmitRef.current();
              return true;
            }
          }
          return false;
        },
      },
      onUpdate: ({ editor: ed }) => {
        isInternalUpdate.current = true;
        const md = ed.storage.markdown.getMarkdown() as string;
        onChange(md);
      },
    });

    useImperativeHandle(ref, () => ({
      focus: () => editor?.commands.focus(),
      clear: () => {
        editor?.commands.clearContent(true);
      },
    }));

    // Sync external value changes (e.g. clearing on submit, transcript injection)
    useEffect(() => {
      if (!editor) return;

      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }

      const currentMd = editor.storage.markdown.getMarkdown() as string;
      if (currentMd !== value) {
        if (!value) {
          editor.commands.clearContent(false);
        } else {
          editor.commands.setContent(value);
        }
      }
    }, [value, editor]);

    // Auto-focus effect
    useEffect(() => {
      if (autoFocus && editor) {
        const timeoutId = setTimeout(() => {
          editor.commands.focus();
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }, [autoFocus, editor]);

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
