import { CSS_VARS } from '@zamp-platform/ui';

import { TASK_STATUS, type TaskStatus } from '../../types/block.types';

interface StatusConfig {
  fill: string;
  stroke: string;
  isDiamond?: boolean;
}

const STATUS_ICON_CONFIG: Record<TaskStatus, StatusConfig> = {
  [TASK_STATUS.COMPLETED]: { fill: CSS_VARS.GREEN_100, stroke: CSS_VARS.GREEN_800 },
  [TASK_STATUS.IN_PROGRESS]: { fill: CSS_VARS.BLUE_100, stroke: CSS_VARS.BLUE_700 },
  [TASK_STATUS.FAILED]: { fill: 'transparent', stroke: CSS_VARS.RED_300, isDiamond: true },
  [TASK_STATUS.NEEDS_INPUT]: { fill: CSS_VARS.ORANGE_200, stroke: CSS_VARS.ORANGE_800, isDiamond: true },
};

interface TaskStatusIconProps {
  status: TaskStatus;
}

const TaskStatusIcon = ({ status }: TaskStatusIconProps) => {
  const config = STATUS_ICON_CONFIG[status] ?? STATUS_ICON_CONFIG[TASK_STATUS.IN_PROGRESS];
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
        <rect x='1' y='1' width='8' height='8' rx='2' fill={fill} stroke={stroke} strokeWidth='1.5' />
      )}
    </svg>
  );
};

export default TaskStatusIcon;
