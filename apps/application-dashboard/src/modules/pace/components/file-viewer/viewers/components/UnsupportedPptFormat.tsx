'use client';

import { Presentation } from 'lucide-react';

interface UnsupportedPptFormatProps {
  fileExtension: string;
}

const UnsupportedPptFormat = ({ fileExtension }: UnsupportedPptFormatProps) => (
  <div className='flex h-full w-full flex-col items-center justify-center gap-4 p-8'>
    <Presentation size={48} className='text-muted-foreground' />
    <div className='text-center'>
      <p className='text-foreground text-sm font-medium'>
        .{fileExtension.toUpperCase()} format is not supported for preview
      </p>
      <p className='text-muted-foreground mt-1 text-xs'>
        Only .pptx files can be previewed. Please download the file to view it.
      </p>
    </div>
  </div>
);

export default UnsupportedPptFormat;
