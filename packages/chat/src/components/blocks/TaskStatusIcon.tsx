import { CSS_VARS } from '@zamp-platform/ui';
import { useId } from 'react';

import { TASK_STATUS, type TaskStatus } from '../../types/block.types';

interface StatusConfig {
  fill: string;
  stroke: string;
  isDiamond?: boolean;
}

const STATUS_ICON_CONFIG: Record<Exclude<TaskStatus, 'IN_PROGRESS'>, StatusConfig> = {
  [TASK_STATUS.COMPLETED]: { fill: CSS_VARS.GREEN_100, stroke: CSS_VARS.GREEN_800 },
  [TASK_STATUS.FAILED]: { fill: CSS_VARS.RED_100, stroke: CSS_VARS.RED_800, isDiamond: true },
  [TASK_STATUS.NEEDS_INPUT]: { fill: CSS_VARS.ORANGE_200, stroke: CSS_VARS.ORANGE_800, isDiamond: true },
};

const InProgressIcon = () => {
  const id = useId().replace(/:/g, '');
  const maskId = `progress-ring-${id}`;

  return (
    <svg
      width='12'
      height='12'
      viewBox='0 0 12 12'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='animate-spin'
      style={{ animationDuration: '1.5s' }}
    >
      <defs>
        <mask id={maskId}>
          <circle cx='6' cy='6' r='4.25' stroke='white' strokeWidth='1.5' fill='none' />
        </mask>
      </defs>
      <foreignObject width='12' height='12' mask={`url(#${maskId})`}>
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `conic-gradient(from 90deg, transparent 0deg, ${CSS_VARS.BLUE_600} 360deg)`,
          }}
        />
      </foreignObject>
    </svg>
  );
};

interface TaskStatusIconProps {
  status: TaskStatus;
}

const TaskStatusIcon = ({ status }: TaskStatusIconProps) => {
  if (status === TASK_STATUS.IN_PROGRESS) {
    return <InProgressIcon />;
  }

  const config = STATUS_ICON_CONFIG[status] ?? STATUS_ICON_CONFIG[TASK_STATUS.COMPLETED];
  const { fill, stroke, isDiamond } = config;

  return (
    <svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
      {isDiamond ? (
        <rect
          x='5'
          y='0.707107'
          width='6'
          height='6'
          rx='1'
          transform='rotate(45 5 0.707107)'
          fill={fill}
          stroke={stroke}
        />
      ) : (
        <rect x='1' y='1' width='6' height='6' rx='1' fill={fill} stroke={stroke} strokeWidth='1.1' />
      )}
    </svg>
  );
};

export default TaskStatusIcon;
