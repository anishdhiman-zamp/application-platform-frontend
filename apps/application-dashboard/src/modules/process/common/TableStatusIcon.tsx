import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';

type TableStatusIconProps = {
  color: string;
  status: ACTIVITY_RUN_STATUS;
};

const TableStatusIcon = ({ color, status }: TableStatusIconProps) => {
  switch (status) {
    case ACTIVITY_RUN_STATUS.NEEDS_ATTENTION:
    case ACTIVITY_RUN_STATUS.PAUSED:
    case ACTIVITY_RUN_STATUS.VOID:
    case ACTIVITY_RUN_STATUS.IN_PROGRESS:
      return <SvgSpriteLoader id='activity' height={12} width={12} color={color} />;
    case ACTIVITY_RUN_STATUS.FAILED:
      return <SvgSpriteLoader id='alert-triangle' height={12} width={12} color={color} />;
    case ACTIVITY_RUN_STATUS.DONE:
      return <SvgSpriteLoader id='check' height={12} width={12} color={color} />;
  }
};

export default TableStatusIcon;
