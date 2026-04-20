import { FC, useState } from 'react';
import { type Editor } from '@tiptap/react';
import { Button, COLORS, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, TooltipV2 } from '@zamp-platform/ui';
import { ChevronDown } from 'lucide-react';
import ImageKitImage from '@/components/ImageKitImage';
import { TEXT_BACKGROUND } from '@/constants/icons';

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
          <Button variant='ghost' size='xsmall' className='flex h-6 items-center gap-1 px-1 pb-[7px] !text-sm'>
            <ImageKitImage
              src={TEXT_BACKGROUND}
              width={18}
              height={16}
              alt='text-background'
              className='min-h-4 min-w-4'
            />
            <ChevronDown size={8} className='text-gray-700' />
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
