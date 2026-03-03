'use client';

import { useCallback, useEffect, useRef } from 'react';
import Editor, { loader, type Monaco, type OnMount } from '@monaco-editor/react';
import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import type { editor } from 'monaco-editor';
import { EXTENSION_TO_MONACO_LANGUAGE } from '@/modules/pace/components/files/files.constants';

// Configure monaco-editor to use version 0.49.0 from CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs',
  },
});

interface MonacoCodeEditorProps {
  content: string;
  language?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

export const getMonacoLanguage = (extension: string): string => {
  return EXTENSION_TO_MONACO_LANGUAGE[extension.toLowerCase()] || 'plaintext';
};

const MonacoCodeEditor = ({
  content,
  language = 'plaintext',
  onChange,
  readOnly = false,
  className = '',
}: MonacoCodeEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.focus();
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange?.(value);
      }
    },
    [onChange],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={cn('animate-opacity h-full w-full', className)}>
      <Editor
        height='100%'
        language={language}
        value={content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={
          <div className='flex h-full w-full items-center justify-center'>
            <Skeleton className='h-full w-full' />
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'off',
          padding: { top: 16, bottom: 16 },
        }}
        theme='vs-light'
      />
    </div>
  );
};

export default MonacoCodeEditor;
