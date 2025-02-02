import { useEffect, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { shouldAllowExpandingRow } from 'modules/widgets/Pivot/pivot.utils';
import { cn } from 'utils/common';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

type PivotRowProps = {
  node: IRowNode;
  value: string;
  maxGroupingLevel: number;
};

const PivotRow = (props: PivotRowProps) => {
  const [expanded, setExpanded] = useState(props?.node?.expanded || false);

  const allowExpanding = shouldAllowExpandingRow(props.node);

  const isLowestLevel = props.node.level === props?.maxGroupingLevel;

  useEffect(() => {
    const updateExpandState = () => {
      setExpanded(props?.node?.expanded || false);
    };

    props?.node?.addEventListener?.('expandedChanged', updateExpandState);

    return () => {
      props?.node?.removeEventListener?.('expandedChanged', updateExpandState);
    };
  }, [props?.node]);

  const formattedValue = props.value || '(Empty)';

  return (
    <div
      className={cn(
        'h-full w-full flex items-center gap-3 pr-6 border-b border-b-[0.5px] border-b-GRAY_400 border-r border-r-[0.5px] border-r-GRAY_400',
        allowExpanding ? 'cursor-pointer' : '',
      )}
      style={{ paddingLeft: `${props?.node?.level * (isLowestLevel ? 52 : 28) + 24}px` }}
      onClick={() => (allowExpanding ? props.node.setExpanded(!expanded) : undefined)}
    >
      {allowExpanding && (
        <SvgSpriteLoader
          id={expanded ? 'chevron-down' : 'chevron-right'}
          iconCategory={ICON_SPRITE_TYPES.ARROWS}
          width={16}
          height={16}
          color={COLORS.GRAY_1000}
        />
      )}
      <span className='f-13-500 text-GRAY_1000'>{formattedValue}</span>
    </div>
  );
};

export default PivotRow;
