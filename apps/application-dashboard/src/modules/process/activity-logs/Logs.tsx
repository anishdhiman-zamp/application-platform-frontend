interface LogsProps {
  setShowSummary: (showSummary: boolean) => void;
}

const Logs = ({ setShowSummary }: LogsProps) => {
  return <div className='overflow-auto w-full h-full p-4' onClick={() => setShowSummary(false)}></div>;
};

export default Logs;
