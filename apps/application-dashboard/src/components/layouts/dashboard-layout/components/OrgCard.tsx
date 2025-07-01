import type { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { sentenceCase } from '@/utils/common';

type OrgCardProps = {
  isSelected: boolean;
  name: string;
  className: string;
};

const OrgCard: FC<OrgCardProps> = ({ isSelected, name, className }) => {
  return (
    <div className='hover:bg-GRAY_100 text-GRAY_1000 flex w-full items-center gap-2 rounded-md p-1'>
      <div className={`${className} f-10-500 flex h-6 w-6 items-center justify-center rounded-sm border border-white`}>
        {sentenceCase(name[0])}
      </div>
      <div className='f-12-450 flex-1'>{name}</div>
      {isSelected && <SvgSpriteLoader id='check' className='text-GRAY_900' size={14} />}
    </div>
  );
};

export default OrgCard;
