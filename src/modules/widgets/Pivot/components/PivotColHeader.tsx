const PivotColHeader = (props: any) => {
  return (
    <div className='w-full h-full bg-white flex items-end justify-end p-3 border-b border-b-[0.5px] border-b-GRAY_400 border-r border-r-[0.5px] border-r-GRAY_400'>
      {props.displayName}
    </div>
  );
};

export default PivotColHeader;
