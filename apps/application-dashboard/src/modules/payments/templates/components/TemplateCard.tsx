import { FC } from 'react';
import SvgSpriteLoader from '@/components/SvgSpriteLoader';
import { MenuItem } from '@/types/common/components';
import { defaultFn } from '@/types/commonTypes';
import { cn } from '@/utils/common';

interface TemplateCardProps {
  title: string;
  source: MenuItem[];
}

const TemplateCard: FC<TemplateCardProps> = ({ title, source }) => {
  return (
    <div className='flex items-center gap-3 px-1.5 py-2.5 rounded-md'>
      <div className='w-6 h-6 flex items-center justify-center bg-BLUE_200 rounded-full'>
        <SvgSpriteLoader id='file-06' size={14} />
      </div>
      <div className='grow'>
        <div className='f-13-500 mb-1'>{title}</div>
        <div className='f-12-400 inline-flex divide-x-1 gap-2 divide-GRAY_400 overflow-hidden border border-GRAY_400 rounded-[4px]'>
          {' '}
          {source.map((item, index) => (
            <div
              key={index}
              className={cn('flex items-center gap-2 py-1 px-1.5 divide-x-1  border-GRAY_400', {
                'border-l': index !== 0,
              })}
            >
              <div className='f-11-400 text-GRAY_700'>{item.label}</div>
              <div className='f-11-450'>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <SvgSpriteLoader id='edit-03' onClick={defaultFn} size={14} />
      <SvgSpriteLoader id='send-03' onClick={defaultFn} size={14} />
    </div>
  );
};

export default TemplateCard;
