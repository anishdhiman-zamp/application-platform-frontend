type PivotAutoGroupHeaderProps = {
  title: string;
};

const PivotAutoGroupHeader = (props: PivotAutoGroupHeaderProps) => {
  return (
    <div className='bg-white w-full h-full p-6 flex items-start border-b border-b-[0.5px] border-b-GRAY_400 border-r border-r-[0.5px] border-r-GRAY_400'>
      {props.title}
    </div>
  );
};

export default PivotAutoGroupHeader;
