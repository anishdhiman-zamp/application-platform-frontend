import { FC } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { cn } from '@/utils/common';
import ProgressBar from 'components/common/RingProgress';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

type DropdownToggleProps = {
  isLoading?: boolean;
  isShowMenu: boolean;
  setIsShowMenu: (val: boolean) => void;
  indicatorColor?: string;
};

const DropdownToggle: FC<DropdownToggleProps> = ({ isLoading, isShowMenu, setIsShowMenu, indicatorColor }) => {
  return (
    <CommonWrapper
      className='h-full right-3 top-0 z-50 flex items-center'
      isLoading={isLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <ProgressBar
          indicatorWidth={2.5}
          trackWidth={2.5}
          size={14}
          className='animate-spin'
          indicatorColor={indicatorColor}
          progress={30}
        />
      }
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
