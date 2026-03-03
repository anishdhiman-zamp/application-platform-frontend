'use client';

import { memo, useEffect, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { replaceAll } from '@milkdown/utils';
import { cn } from '@zamp-platform/ui/utils';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import 'modules/pace/components/file-viewer/viewers/milkdown-editor.css';

interface MilkdownEditorProps {
  content: string;
  onChange?: (value: string) => void;
  className?: string;
}

const CrepeEditor = ({ content, onChange }: { content: string; onChange?: (value: string) => void }) => {
  const onChangeRef = useRef(onChange);
  const editorContentRef = useRef(content);

  onChangeRef.current = onChange;

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: content,
    });

    crepe.on((listener) => {
      listener.markdownUpdated((_, markdown) => {
        editorContentRef.current = markdown;
        onChangeRef.current?.(markdown);
      });
    });

    return crepe;
  }, []);

  const [loading, getInstance] = useInstance();

  useEffect(() => {
    if (loading) return;
    if (content === editorContentRef.current) return;

    const editor = getInstance();

    if (editor) {
      editorContentRef.current = content;
      editor.action(replaceAll(content));
    }
  }, [content, loading, getInstance]);

  return <Milkdown />;
};

const MilkdownEditor = ({ content, onChange, className = '' }: MilkdownEditorProps) => {
  return (
    <div className={cn('milkdown-editor-wrapper animate-opacity h-full w-full overflow-auto', className)}>
      <MilkdownProvider>
        <CrepeEditor content={content} onChange={onChange} />
      </MilkdownProvider>
    </div>
  );
};

export default memo(MilkdownEditor);
