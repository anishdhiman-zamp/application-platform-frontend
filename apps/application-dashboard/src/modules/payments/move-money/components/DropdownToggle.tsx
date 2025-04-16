import { FC } from 'react';
import { cn } from '@/utils/common';
import ProgressBar from 'components/common/RingProgress';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type DropdownToggleProps = {
  isLoading?: boolean;
  isShowMenu: boolean;
  setIsShowMenu: (val: boolean) => void;
};

const DropdownToggle: FC<DropdownToggleProps> = ({ isLoading, isShowMenu, setIsShowMenu }) => {
  return (
    <CommonWrapper
      className='tw-h-full tw-right-3 tw-top-0 tw-absolute tw-z-50 tw-flex tw-items-center'
      isLoading={isLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      skeleton={
        <ProgressBar indicatorWidth={2.5} trackWidth={2.5} size={14} className='tw-animate-spin' progress={30} />
      }
    >
      <SvgSpriteLoader
        onClick={() => setIsShowMenu(!isShowMenu)}
        id='chevron-down'
        className={cn('tw-cursor-pointer transition-all duration-200', {
          'rotate-180': isShowMenu,
        })}
        size={14}
      />
    </CommonWrapper>
  );
};

export default DropdownToggle;
