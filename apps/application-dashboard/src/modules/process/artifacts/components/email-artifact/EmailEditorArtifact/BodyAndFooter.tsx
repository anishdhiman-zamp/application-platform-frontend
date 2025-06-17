import { type FC, Fragment, useMemo } from 'react';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';
import { TextStyleWithBackground } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/extensions/background-color';
import { FontSize } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/extensions/font-size';
import FontSizeSelector from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/FontSizeSelector';
import TextAlignmentSelector from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/TextAlignmentSelector';
import TextAndBackgroundColor from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/TextAndBackgroundColorSelector';
import {
  BodyAndFooterProps,
  ToolbarConfig,
} from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/types';

const BodyAndFooter: FC<BodyAndFooterProps> = ({
  initialContent = '<p></p>',
  onSend,
  onDelete,
  className,
  bodyClassName,
  footerClassName,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyleWithBackground,
      Underline,
      FontSize,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
  });

  const toolbarConfigs: ToolbarConfig[] = useMemo(
    () => [
      {
        icon: 'flip-backward',
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        icon: 'flip-forward',
        onClick: () => editor?.chain().focus().redo().run(),
        showDivider: true,
      },
      {
        showDivider: true,
        component: <FontSizeSelector editor={editor} />,
      },
      {
        icon: 'bold-02',
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        icon: 'italic-01',
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        icon: 'underline-01',
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
      {
        component: <TextAndBackgroundColor editor={editor} />,
        showDivider: true,
      },
      {
        component: <TextAlignmentSelector editor={editor} />,
      },
      {
        icon: 'list',
        onClick: () => editor?.chain().focus().toggleBulletList().run(),
        showDivider: true,
      },
      {
        icon: 'strikethrough-01',
        onClick: () => editor?.chain().focus().toggleStrike().run(),
        showDivider: true,
      },
      {
        icon: 'type-strikethrough-01',
        onClick: () => editor?.commands.unsetAllMarks(),
      },
    ],
    [editor],
  );

  return (
    <>
      <div className={cn('px-4 py-3', className)}>
        <EditorContent editor={editor} className={cn('prose w-full max-w-none', bodyClassName)} />
        {editor && (
          <div className='shadow-side-drawer-inner absolute bottom-4 z-1 flex h-8 w-fit items-center gap-2 rounded-md border bg-white px-2 py-1'>
            {toolbarConfigs.map((config) => (
              <Fragment key={config.icon}>
                {config.component ?? (
                  <Button onClick={config?.onClick} variant='ghost' size='xsmall' className='h-6 px-1'>
                    <SvgSpriteLoader id={config?.icon || ''} />
                  </Button>
                )}
                {config.showDivider && <div className='h-4 w-px border' />}
              </Fragment>
            ))}
          </div>
        )}
      </div>
      <div className={cn('border-GRAY_500 flex items-center justify-between border-t px-4 py-3', footerClassName)}>
        <Button size='small' onClick={() => onSend?.(editor?.getHTML() || '')} disabled>
          Send
        </Button>
        <Button variant='ghost' size='xxsmall' onClick={onDelete} disabled>
          <SvgSpriteLoader id='trash-01' />
        </Button>
      </div>
    </>
  );
};

export default BodyAndFooter;
