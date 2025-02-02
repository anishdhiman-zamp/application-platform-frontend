import { cn } from 'utils/common';

type Props = {
  value: string;
};

const PivotCell = (props: Props) => {
  return (
    <div
      className={cn(
        'h-full w-full flex items-center justify-end gap-3 px-3 border-b border-b-[0.5px] border-b-GRAY_400 border-r border-r-[0.5px] border-r-GRAY_400 f-13-450',
      )}
    >
      {props.value}
    </div>
  );
};

export default PivotCell;
