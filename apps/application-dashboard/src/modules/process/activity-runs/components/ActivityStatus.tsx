import { STATUS_ICON_COLOR_MAPPING } from 'modules/process/process.constant';
import type { ACTIVITY_RUN_STATUS } from 'modules/process/process.types';
import TableStatusIcon from '@/modules/process/common/TableStatusIcon';

const ActivityStatus = ({ value }: { value: ACTIVITY_RUN_STATUS }) => {
  return (
    <TableStatusIcon
      status={value as ACTIVITY_RUN_STATUS}
      color={STATUS_ICON_COLOR_MAPPING[value as ACTIVITY_RUN_STATUS]?.tableStatusIcon?.color}
    />
  );
};

export default ActivityStatus;
