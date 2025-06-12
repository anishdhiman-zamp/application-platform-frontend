import { FC } from 'react';
import { type Editor } from '@tiptap/react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { FONT_SIZES } from 'modules/process/artifacts/components/EmailEditorArtifact/constants';
import { COLORS } from '@/constants/colors';

const FontSizeSelector: FC<{ editor: Editor | null }> = ({ editor }) => {
  const handleFontSize = (fontSize: string) => {
    editor?.chain().focus().setMark('fontSize', { fontSize }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='xsmall' className='flex h-6 items-center gap-1 px-1'>
          <SvgSpriteLoader id='type-01' />
          <SvgSpriteLoader id='chevron-down' color={COLORS.GRAY_700} size={8} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {FONT_SIZES.map((fontSize) => (
          <DropdownMenuItem key={fontSize.value} onClick={() => handleFontSize(fontSize.value)}>
            {fontSize.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FontSizeSelector;
