import { type FC } from 'react';
import LogInput from 'modules/process/activity-logs/components/LogInput';
import LogTopbar from 'modules/process/activity-logs/components/LogTopbar';
import LogsSection from 'modules/process/activity-logs/LogsSection';
import type { HandleShowArtifactsProps } from 'modules/process/process.types';
import { cn } from '@/utils/common';

interface ActivityLogsProps {
  processId: string;
  activityId: string;
  handleShowArtifacts: (props: HandleShowArtifactsProps) => void;
  className?: string;
}

const ActivityLogs: FC<ActivityLogsProps> = ({ handleShowArtifacts, processId, activityId, className }) => {
  return (
    <div className={cn('flex h-full max-w-full flex-1 flex-col overflow-auto', className)}>
      <LogTopbar />
      <LogsSection processId={processId} activityId={activityId} handleShowArtifacts={handleShowArtifacts} />
      <LogInput processId={processId} activityId={activityId} />
    </div>
  );
};

export default ActivityLogs;
