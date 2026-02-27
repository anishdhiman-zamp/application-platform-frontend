'use client';

import { memo, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { cn } from '@zamp-platform/ui/utils';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import 'modules/pace/components/file-viewer/viewers/milkdown-editor.css';

interface MilkdownEditorProps {
  content: string;
  onChange?: (value: string) => void;
  className?: string;
}

interface CrepeEditorProps {
  defaultValue: string;
  onChange?: (value: string) => void;
}

const CrepeEditor = ({ defaultValue, onChange }: CrepeEditorProps) => {
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue,
    });

    crepe.on((listener) => {
      listener.markdownUpdated((_, markdown) => {
        onChangeRef.current?.(markdown);
      });
    });

    return crepe;
  }, []);

  return <Milkdown />;
};

const MilkdownEditor = ({ content, onChange, className = '' }: MilkdownEditorProps) => {
  return (
    <div className={cn('milkdown-editor-wrapper animate-opacity h-full w-full overflow-auto', className)}>
      <MilkdownProvider>
        <CrepeEditor defaultValue={content} onChange={onChange} />
      </MilkdownProvider>
    </div>
  );
};

export default memo(MilkdownEditor);
