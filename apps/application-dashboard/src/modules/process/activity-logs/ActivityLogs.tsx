import type { FC } from 'react';
import LogInput from 'modules/process/activity-logs/components/LogInput';
import Topbar from 'modules/process/activity-logs/components/LogTopbar';
import LogsSection from 'modules/process/activity-logs/LogsSection';
import { cn } from '@/utils/common';

interface ActivityLogsProps {
  processId: string;
  activityId: string;
  status: string;
  handleShowArtifacts: () => void;
  className?: string;
}

const ActivityLogs: FC<ActivityLogsProps> = ({ handleShowArtifacts, processId, activityId, status, className }) => {
  return (
    <div className={cn('overflow-auto max-w-full h-full flex flex-col', className)}>
      <Topbar status={status} />
      <LogsSection processId={processId} activityId={activityId} handleShowArtifacts={handleShowArtifacts} />
      <LogInput processId={processId} activityId={activityId} />
    </div>
  );
};

export default ActivityLogs;
