'use client';

import { useCallback, useEffect, useRef } from 'react';
import Editor, { loader, type Monaco, type OnMount } from '@monaco-editor/react';
import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import type { editor } from 'monaco-editor';
import { useTheme } from '@/app/_providers/theme-provider';
import { THEME_MODE } from '@/modules/general/constants/general.constants';
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

const MonacoCodeEditor = ({
  content,
  language = 'plaintext',
  onChange,
  readOnly = false,
  className = '',
}: MonacoCodeEditorProps) => {
  const { resolvedTheme } = useTheme();
  const monacoTheme = resolvedTheme === THEME_MODE.DARK ? 'vs-dark' : 'vs-light';
  const isDarkTheme = resolvedTheme === THEME_MODE.DARK;

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
    <div
      className={cn(
        'animate-opacity h-full w-full overflow-hidden',
        isDarkTheme ? 'bg-[#1e1e1e]' : 'bg-BG_WHITE',
        className,
      )}
    >
      <div className='mx-auto h-full w-full max-w-[656px] overflow-hidden'>
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
            padding: { top: 24, bottom: 24 },
          }}
          theme={monacoTheme}
        />
      </div>
    </div>
  );
};

export default MonacoCodeEditor;
