import LogInput from 'modules/process/activity-logs/components/LogInput';
import Topbar from 'modules/process/activity-logs/components/LogTopbar';

interface ActivityLogsProps {
  setShowSummary: (showSummary: boolean) => void;
}

const ActivityLogs = ({ setShowSummary }: ActivityLogsProps) => {
  return (
    <div className='overflow-auto max-w-full h-full relative' onClick={() => setShowSummary(false)}>
      <Topbar />
      <LogInput />
    </div>
  );
};

export default ActivityLogs;
