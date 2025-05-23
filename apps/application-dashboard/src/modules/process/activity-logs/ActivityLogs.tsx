import { type FC } from 'react';
import LogInput from 'modules/process/activity-logs/components/LogInput';
import LogTopbar from 'modules/process/activity-logs/components/LogTopbar';
import LogsSection from 'modules/process/activity-logs/LogsSection';
import { ARTIFACT_TYPE, CTA_ACTION } from 'modules/process/process.types';
import { cn } from '@/utils/common';

interface ActivityLogsProps {
  processId: string;
  activityId: string;
  handleShowArtifacts: (artifactType: ARTIFACT_TYPE, artifactId: string, action?: CTA_ACTION) => void;
  className?: string;
}

const ActivityLogs: FC<ActivityLogsProps> = ({ handleShowArtifacts, processId, activityId, className }) => {
  return (
    <div className={cn('overflow-auto max-w-full h-full flex flex-1 flex-col', className)}>
      <LogTopbar />
      <LogsSection processId={processId} activityId={activityId} handleShowArtifacts={handleShowArtifacts} />
      <LogInput processId={processId} activityId={activityId} />
    </div>
  );
};

export default ActivityLogs;
