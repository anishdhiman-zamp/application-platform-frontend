import { FC, useState } from 'react';
import { type Editor } from '@tiptap/react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from '@/constants/colors';

const TextAlignmentSelector: FC<{ editor: Editor | null }> = ({ editor }) => {
  const [alignment, setAlignment] = useState<'left' | 'right' | 'justify'>('left');

  const handleTextAlignment = (alignment: 'left' | 'right' | 'justify') => {
    editor?.chain().focus().setTextAlign(alignment).run();
    setAlignment(alignment);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='xsmall' className='flex h-6 items-center gap-1 px-1'>
          <SvgSpriteLoader id={`align-${alignment}`} />
          <SvgSpriteLoader id='chevron-down' color={COLORS.GRAY_700} size={8} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-fit'>
        <DropdownMenuItem onClick={() => handleTextAlignment('left')}>
          <SvgSpriteLoader id='align-left' />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTextAlignment('justify')}>
          <SvgSpriteLoader id='align-justify' />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTextAlignment('right')}>
          <SvgSpriteLoader id='align-right' />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TextAlignmentSelector;
