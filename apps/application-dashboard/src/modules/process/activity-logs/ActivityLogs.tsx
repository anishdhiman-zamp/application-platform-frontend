import LogInput from 'modules/process/activity-logs/components/LogInput';
import Topbar from 'modules/process/activity-logs/components/LogTopbar';
import LogsSection from 'modules/process/activity-logs/LogsSection';

interface ActivityLogsProps {
  setShowSummary: (showSummary: boolean) => void;
}

const ActivityLogs = ({ setShowSummary }: ActivityLogsProps) => {
  return (
    <div className='overflow-auto max-w-full h-full flex flex-col' onClick={() => setShowSummary(false)}>
      <Topbar />
      <LogsSection setShowSummary={setShowSummary} />
      <LogInput />
    </div>
  );
};

export default ActivityLogs;
