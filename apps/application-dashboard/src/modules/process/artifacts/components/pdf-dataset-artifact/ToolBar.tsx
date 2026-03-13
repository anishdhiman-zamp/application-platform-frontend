import type { FC } from 'react';
import type { TUsePDFSlickStore } from '@pdfslick/react';
import { COLORS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@zamp-platform/ui/utils';

interface ToolBarPropsType {
  usePDFSlickStore: TUsePDFSlickStore;
  className?: string;
}

const ToolBar: FC<ToolBarPropsType> = ({ usePDFSlickStore, className }) => {
  const { pageNumber, numPages, scale, pdfSlick } = usePDFSlickStore();

  return (
    <div
      className={cn(
        'absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 transform items-center rounded-md bg-black whitespace-nowrap',
        className,
      )}
    >
      {/* Download Button */}
      <SvgSpriteLoader
        id='download-02'
        color={COLORS.WHITE}
        size={14}
        onClick={() => pdfSlick?.downloadOrSave()}
        className='cursor-pointer rounded px-2.5 py-1.5'
      />

      <div className='border-GRAY_950 flex items-center justify-center gap-x-1.5 border-l px-2.5 py-1.5'>
        {/* Previous Page */}
        <SvgSpriteLoader
          id='chevron-up'
          color={pageNumber <= 1 ? COLORS.GRAY_600 : COLORS.WHITE}
          size={12}
          onClick={() => pdfSlick?.viewer?.previousPage()}
          className={cn('cursor-pointer rounded p-0.5', pageNumber <= 1 ? 'cursor-not-allowed opacity-50' : '')}
        />

        <div className='f-11-500 flex items-center gap-x-1.5 text-white select-none'>
          <span>Page</span>
          <span className='bg-GRAY_950 rounded px-2 py-0.5'>{pageNumber}</span>
          <span>/</span>
          <span>{numPages ?? '--'}</span>
        </div>

        {/* Next Page */}
        <SvgSpriteLoader
          id='chevron-down'
          color={pageNumber >= numPages ? COLORS.GRAY_600 : COLORS.WHITE}
          size={12}
          onClick={() => pdfSlick?.viewer?.nextPage()}
          className={cn('cursor-pointer rounded p-0.5', pageNumber >= numPages ? 'cursor-not-allowed opacity-50' : '')}
        />

        {/* Zoom Controls */}
        <SvgSpriteLoader
          id='zoom-out'
          color={scale <= 0.1 ? COLORS.GRAY_600 : COLORS.WHITE}
          size={12}
          onClick={() => pdfSlick?.viewer?.decreaseScale()}
          className={cn('cursor-pointer rounded p-0.5', scale <= 0.1 ? 'cursor-not-allowed opacity-50' : '')}
        />
        <SvgSpriteLoader
          id='zoom-in'
          color={scale >= 5.0 ? COLORS.GRAY_600 : COLORS.WHITE}
          size={12}
          onClick={() => pdfSlick?.viewer?.increaseScale()}
          className={cn('cursor-pointer rounded p-0.5', scale >= 5.0 ? 'cursor-not-allowed opacity-50' : '')}
        />
      </div>
    </div>
  );
};

export default ToolBar;
