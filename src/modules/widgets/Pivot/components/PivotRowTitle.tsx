import { FC, useEffect, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import { ARROW_RIGHT, CHEVRON_DOWN, CHEVRON_RIGHT, DISABLED_CHEVRON_RIGHT, OTHER_GATEWAY } from 'constants/icons';
import {
  getReconStatusIcon,
  RECON_PAYMENT_ICONS,
  RECON_STATUS_TYPES,
  ROOT_LEVEL_TITLE,
} from 'modules/widgets/Pivot/pivot.constants';
import { shouldAllowExpandingRow } from 'modules/widgets/Pivot/pivot.utils';
import Image from 'next/image';
import { cn, snakeCaseToSentenceCase } from 'utils/common';

type PivotRowTitleProps = {
  node: IRowNode;
  value: string;
  maxGroupingLevel: number;
  showIcons?: boolean;
};

const PivotRowTitle: FC<PivotRowTitleProps> = ({ value, node, maxGroupingLevel, showIcons = false }) => {
  const [expanded, setExpanded] = useState(node?.expanded || false);
  const allowExpanding = shouldAllowExpandingRow(node);

  const isLowestLevel = node?.level === maxGroupingLevel;
  const isTopLevel = node?.level === 0;
  const isRootLevel = node?.level === -1;
  const formattedValue = snakeCaseToSentenceCase(value);

  useEffect(() => {
    const updateExpandState = () => setExpanded(node?.expanded || false);

    node?.addEventListener?.('expandedChanged', updateExpandState);

    return () => node?.removeEventListener?.('expandedChanged', updateExpandState);
  }, [node?.expanded]);

  return (
    <div
      className={cn(
        'h-full w-full flex items-center gap-2 border-b-0.5 border-r-0.5 border-GRAY_400 z-10',
        allowExpanding && 'cursor-pointer',
        isLowestLevel && 'bg-BACKGROUND_GRAY_1',
        isRootLevel && 'justify-end pr-3 gap-1 bg-BACKGROUND_GRAY_1',
      )}
      style={{
        paddingLeft: `${node?.level * (isLowestLevel ? 46 : 28) + 24}px`,
        willChange: 'transform',
      }}
      onClick={() => allowExpanding && node.setExpanded(!expanded)}
    >
      {!isRootLevel && !isLowestLevel && (
        <Image
          src={allowExpanding ? (expanded ? CHEVRON_DOWN : CHEVRON_RIGHT) : DISABLED_CHEVRON_RIGHT}
          width={18}
          height={18}
          alt={expanded ? 'chevron-down' : 'chevron-right'}
          priority
        />
      )}

      {showIcons && isTopLevel && (
        <Image
          src={getReconStatusIcon(value as RECON_STATUS_TYPES)}
          alt={value ?? 'recon-status'}
          width={18}
          height={18}
          priority
        />
      )}

      {showIcons && isLowestLevel && (
        <Image
          src={RECON_PAYMENT_ICONS[value as keyof typeof RECON_PAYMENT_ICONS] ?? OTHER_GATEWAY}
          alt={value ?? 'Bank'}
          width={18}
          height={18}
          priority
          className='ml-1.5'
        />
      )}

      <span
        className='f-13-550 text-GRAY_950 overflow-hidden text-ellipsis whitespace-nowrap max-w-[280px]'
        title={formattedValue}
      >
        {isRootLevel ? ROOT_LEVEL_TITLE : formattedValue}
      </span>

      {isRootLevel && <Image src={ARROW_RIGHT} alt={'arrow-right'} width={18} height={18} priority />}
    </div>
  );
};

export default PivotRowTitle;
