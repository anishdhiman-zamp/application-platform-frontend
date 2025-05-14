import DateSeparator from 'modules/process/activity-logs/components/DateSeparator';
import Log from 'modules/process/activity-logs/components/Log';

interface LogsSectionProps {
  setShowSummary: (showSummary: boolean) => void;
}

const LogsSection = ({ setShowSummary }: LogsSectionProps) => {
  return (
    <div
      className='overflow-auto w-full flex-1 px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
      onClick={() => setShowSummary(false)}
    >
      <DateSeparator />
      <Log />
      <Log isLastLog />
    </div>
  );
};

export default LogsSection;
