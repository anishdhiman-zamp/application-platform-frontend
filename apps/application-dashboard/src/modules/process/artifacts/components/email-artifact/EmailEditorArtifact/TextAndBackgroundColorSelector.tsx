import { FC, useState } from 'react';
import { type Editor } from '@tiptap/react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import TooltipV2 from '@/components/common/TooltipV2';
import { COLORS } from '@/constants/colors';

const TextAndBackgroundColor: FC<{ editor: Editor | null }> = ({ editor }) => {
  const [textColor, setTextColor] = useState(COLORS.BLACK);
  const [bgColor, setBgColor] = useState(COLORS.WHITE);

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;

    setTextColor(color);
    editor?.chain().focus().setColor(color).run();
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;

    setBgColor(color);
    editor?.chain().focus().setMark('textStyle', { backgroundColor: color }).run();
  };

  return (
    <DropdownMenu>
      <TooltipV2 tooltipBody='Text and Background Color' asChildTrigger>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='xsmall' className='flex h-6 items-center gap-1 px-1 underline'>
            A <SvgSpriteLoader id='chevron-down' color={COLORS.GRAY_700} size={8} />
          </Button>
        </DropdownMenuTrigger>
      </TooltipV2>

      <DropdownMenuContent>
        <div className='flex items-center gap-2'>
          <label className='text-sm'>Text:</label>
          <input type='color' value={textColor} onChange={handleTextColorChange} className='h-6 w-6' />

          <label className='text-sm'>Background:</label>
          <input type='color' value={bgColor} onChange={handleBgColorChange} className='h-6 w-6' />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TextAndBackgroundColor;
