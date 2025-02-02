type Props = {
  displayName: string;
};

const PivotColGroupHeader = (props: Props) => {
  return (
    <div className='w-full h-full flex items-center justify-center bg-white border-b border-b-[0.5px] border-b-GRAY_400 border-r border-r-[0.5px] border-r-GRAY_400'>
      {props?.displayName}
    </div>
  );
};

export default PivotColGroupHeader;
