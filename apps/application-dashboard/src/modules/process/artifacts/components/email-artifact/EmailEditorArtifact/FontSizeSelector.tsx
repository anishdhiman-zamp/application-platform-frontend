import { FC } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TooltipV2,
} from '@zamp-platform/ui';
import { ChevronDown, Type } from 'lucide-react';
import { FONT_SIZES } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/constants';

const FontSizeSelector: FC<{ editor: Editor | null }> = ({ editor }) => {
  const handleFontSize = (fontSize: string) => {
    editor?.chain().focus().setMark('fontSize', { fontSize }).run();
  };

  return (
    <DropdownMenu>
      <TooltipV2 tooltipBody='Font Size' asChildTrigger>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='xsmall' className='flex h-6 items-center gap-1 px-1'>
            <Type size={14} />
            <ChevronDown size={8} className='text-gray-700' />
          </Button>
        </DropdownMenuTrigger>
      </TooltipV2>
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
