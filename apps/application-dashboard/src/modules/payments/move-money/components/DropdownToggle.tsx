import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/common';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

type DropdownToggleProps = {
  isLoading?: boolean;
  isShowMenu: boolean;
  setIsShowMenu: (val: boolean) => void;
  indicatorColor?: string;
};

const DropdownToggle: FC<DropdownToggleProps> = ({ isLoading, isShowMenu, setIsShowMenu }) => {
  return (
    <CommonWrapper
      className='right-3 top-0 z-50 flex h-full items-center'
      isLoading={isLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<Loader2 className='max-w-3 animate-spin' />}
    >
      <SvgSpriteLoader
        onClick={() => setIsShowMenu(!isShowMenu)}
        id='chevron-down'
        className={cn('cursor-pointer transition-all duration-200', {
          'rotate-180': isShowMenu,
        })}
        size={14}
      />
    </CommonWrapper>
  );
};

export default DropdownToggle;
