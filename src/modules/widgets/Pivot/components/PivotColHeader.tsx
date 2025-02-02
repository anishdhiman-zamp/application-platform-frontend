import { ColDef } from 'ag-grid-community';
import { getHumanReadableColumnName } from 'modules/widgets/Pivot/pivot.utils';

type Props = {
  column: {
    colDef: ColDef;
  };
  displayName: string;
};

const PivotColHeader = (props: Props) => {
  const contextFieldName = getHumanReadableColumnName(props.column.colDef?.context?.name || '');

  return (
    <div className='flex flex-col items-center justify-center w-auto h-full bg-white flex items-end justify-end p-3 border-b border-b-[0.5px] border-b-GRAY_400 border-r border-r-[0.5px] border-r-GRAY_400 break-words whitespace-normal'>
      {contextFieldName || props.displayName}
    </div>
  );
};

export default PivotColHeader;
