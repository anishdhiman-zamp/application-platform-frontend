import { FC, useEffect, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import { COLORS } from 'constants/colors';
import { ICON_SPRITE_TYPES, OTHER_GATEWAY } from 'constants/icons';
import { RECON_PAYMENT_ICONS, RECON_STATUS_ICONS, ROOT_LEVEL_TITLE } from 'modules/widgets/Pivot/pivot.constants';
import { shouldAllowExpandingRow } from 'modules/widgets/Pivot/pivot.utils';
import Image from 'next/image';
import { cn, snakeCaseToSentenceCase } from 'utils/common';
import MemoizedSvgSpriteLoader from 'components/SvgSpriteLoader';

type PivotRowTitleProps = {
  node: IRowNode;
  value: string;
  maxGroupingLevel: number;
};

const PivotRowTitle: FC<PivotRowTitleProps> = ({ value, node, maxGroupingLevel }) => {
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
        'h-full w-full flex items-center gap-3 border-b-0.5 border-r-0.5 border-GRAY_400',
        allowExpanding && 'cursor-pointer',
        isLowestLevel && 'bg-BACKGROUND_GRAY_1',
        isRootLevel && 'justify-end pr-3 gap-1 bg-BACKGROUND_GRAY_1',
      )}
      style={{ paddingLeft: `${node?.level * (isLowestLevel ? 52 : 28) + 24}px`, willChange: 'transform' }}
      onClick={() => allowExpanding && node.setExpanded(!expanded)}
    >
      {allowExpanding && !isRootLevel && (
        <MemoizedSvgSpriteLoader
          id={expanded ? 'chevron-down' : 'chevron-right'}
          iconCategory={ICON_SPRITE_TYPES.ARROWS}
          width={18}
          height={18}
          color={expanded ? COLORS.GRAY_950 : COLORS.GRAY_600}
        />
      )}

      {isTopLevel && (
        <MemoizedSvgSpriteLoader
          id={RECON_STATUS_ICONS[value as keyof typeof RECON_STATUS_ICONS].id}
          iconCategory={
            RECON_STATUS_ICONS[value as keyof typeof RECON_STATUS_ICONS].iconCategory ?? ICON_SPRITE_TYPES.GENERAL
          }
          width={18}
          height={18}
          color={RECON_STATUS_ICONS[value as keyof typeof RECON_STATUS_ICONS].color ?? COLORS.GRAY_400}
        />
      )}

      {isLowestLevel && (
        <Image
          src={RECON_PAYMENT_ICONS[value as keyof typeof RECON_PAYMENT_ICONS] ?? OTHER_GATEWAY}
          alt={value ?? 'Bank'}
          width={18}
          height={18}
          priority
        />
      )}

      <span className='f-13-550 text-GRAY_950'>{isRootLevel ? ROOT_LEVEL_TITLE : formattedValue}</span>

      {isRootLevel && (
        <MemoizedSvgSpriteLoader
          id='arrow-right'
          iconCategory={ICON_SPRITE_TYPES.ARROWS}
          width={18}
          height={18}
          color={COLORS.GRAY_950}
        />
      )}
    </div>
  );
};

export default PivotRowTitle;
