import React, { FC } from 'react';
import { CSS_VARS } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { LOADER_STATUS } from 'modules/data/data.types';
import ProgressBar from 'components/common/RingProgress';

type StatusIndicatorPropsType = {
  status: LOADER_STATUS;
};

const LOADING_STATES = [LOADER_STATUS.LOADING, LOADER_STATUS.INITIATED, LOADER_STATUS.ALIGNMENT_PENDING];
const SUCCESS_STATES = [LOADER_STATUS.SUCCESS, LOADER_STATUS.ALIGNMENT_COMPLETED];

const StatusIndicator: FC<StatusIndicatorPropsType> = ({ status }) => {
  if (LOADING_STATES.includes(status)) {
    return (
      <ProgressBar
        trackColor={CSS_VARS.GRAY_400}
        indicatorColor={'#22A356'}
        indicatorWidth={3}
        trackWidth={3}
        size={20}
        className='animate-spin'
        progress={30}
      />
    );
  }

  if (SUCCESS_STATES.includes(status)) {
    return <SvgSpriteLoader id='check-circle' width={16} height={16} color={CSS_VARS.GREEN_700} className='mt-0.5' />;
  }

  return <SvgSpriteLoader id='alert-circle' width={16} height={16} color={CSS_VARS.RED_700} className='mt-0.5' />;
};

export default StatusIndicator;
