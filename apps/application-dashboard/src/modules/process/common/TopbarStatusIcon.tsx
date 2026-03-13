import { CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';

type TopbarStatusIconProps = {
  fillColor: string;
  strokeColor: string;
  status: ACTIVITY_RUN_STATUS;
};

const TopbarStatusIcon = ({ fillColor, strokeColor, status }: TopbarStatusIconProps) => {
  switch (status) {
    case ACTIVITY_RUN_STATUS.NEEDS_ATTENTION:
    case ACTIVITY_RUN_STATUS.IN_PROGRESS:
      return <SvgSpriteLoader id='activity' size={12} color={strokeColor} />;
    case ACTIVITY_RUN_STATUS.FAILED:
      return <SvgSpriteLoader id='alert-triangle' size={12} color={strokeColor} />;
    case ACTIVITY_RUN_STATUS.DONE:
      return <SvgSpriteLoader id='check' size={12} color={strokeColor} />;
    case ACTIVITY_RUN_STATUS.VOID:
      return (
        <svg width='8' height='8' viewBox='0 0 8 8' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <rect x='0.5' y='0.5' width='7' height='7' rx='1.5' fill={fillColor} stroke={strokeColor} />
        </svg>
      );
    case ACTIVITY_RUN_STATUS.PAUSED:
      return (
        <svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <rect x='2' y='2' width='3' height='8' rx='1' fill={fillColor} />
          <rect x='7' y='2' width='3' height='8' rx='1' fill={strokeColor} />
        </svg>
      );
    default:
      return (
        <svg width='10' height='12' viewBox='0 0 10 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M9 2.5C9 3.32843 7.20914 4 5 4C2.79086 4 1 3.32843 1 2.5M9 2.5C9 1.67157 7.20914 1 5 1C2.79086 1 1 1.67157 1 2.5M9 2.5V9.5C9 10.3284 7.20914 11 5 11C2.79086 11 1 10.3284 1 9.5V2.5M9 4.8333C9 5.66173 7.20914 6.3333 5 6.3333C2.79086 6.3333 1 5.66173 1 4.8333M9 7.165C9 7.99343 7.20914 8.665 5 8.665C2.79086 8.665 1 7.99343 1 7.165'
            stroke={CSS_VARS.GRAY_900}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      );
  }
};

export default TopbarStatusIcon;
