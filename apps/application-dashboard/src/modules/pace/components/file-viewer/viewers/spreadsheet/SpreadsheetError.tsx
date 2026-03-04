interface SpreadsheetErrorProps {
  message: string;
}

const SpreadsheetError = ({ message }: SpreadsheetErrorProps) => {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='text-center'>
        <p className='f-14-500 text-GRAY_900 mb-1'>Failed to load spreadsheet</p>
        <p className='f-12-400 text-GRAY_700'>{message}</p>
      </div>
    </div>
  );
};

export default SpreadsheetError;
