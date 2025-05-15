import type { FC } from 'react';
import LogInput from 'modules/process/activity-logs/components/LogInput';
import Topbar from 'modules/process/activity-logs/components/LogTopbar';
import LogsSection from 'modules/process/activity-logs/LogsSection';

interface ActivityLogsProps {
  processId: string;
  activityId: string;
  status: string;
  setShowSummary: (showSummary: boolean) => void;
}

const ActivityLogs: FC<ActivityLogsProps> = ({ setShowSummary, processId, activityId, status }) => {
  return (
    <div className='overflow-auto max-w-full h-full flex flex-col'>
      <Topbar status={status} />
      <LogsSection processId={processId} activityId={activityId} setShowSummary={setShowSummary} />
      <LogInput />
    </div>
  );
};

export default ActivityLogs;
