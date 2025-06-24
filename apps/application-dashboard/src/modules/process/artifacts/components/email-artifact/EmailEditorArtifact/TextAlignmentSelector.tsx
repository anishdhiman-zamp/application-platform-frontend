import { FC, useState } from 'react';
import { type Editor } from '@tiptap/react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import Image from 'next/image';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';
import { ALIGN_CENTER } from '@/constants/icons';

const TextAlignmentSelector: FC<{ editor: Editor | null }> = ({ editor }) => {
  const [alignment, setAlignment] = useState<'left' | 'right' | 'center'>('left');

  const handleTextAlignment = (alignment: 'left' | 'right' | 'center') => {
    editor?.chain().focus().setTextAlign(alignment).run();
    setAlignment(alignment);
  };

  return (
    <DropdownMenu>
      <TooltipV2 tooltipBody='Text Alignment' asChildTrigger>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='xsmall' className='flex h-6 items-center gap-1 px-1'>
            <SvgSpriteLoader id={`align-${alignment}`} />
            <SvgSpriteLoader id='chevron-down' color={COLORS.GRAY_700} size={8} />
          </Button>
        </DropdownMenuTrigger>
      </TooltipV2>
      <DropdownMenuContent className='w-fit'>
        <DropdownMenuItem onClick={() => handleTextAlignment('left')}>
          <SvgSpriteLoader id='align-left' />
          <span>Left</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTextAlignment('center')}>
          <Image src={ALIGN_CENTER} alt='align-center' width={20} height={20} className='opacity-70' />
          <span>Center</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTextAlignment('right')}>
          <SvgSpriteLoader id='align-right' />
          <span>Right</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TextAlignmentSelector;
