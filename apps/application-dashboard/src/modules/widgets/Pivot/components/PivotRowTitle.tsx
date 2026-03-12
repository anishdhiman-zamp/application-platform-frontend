import { FC, useEffect, useState } from 'react';
import { IRowNode } from 'ag-grid-community';
import {
  ARROW_RIGHT,
  CHEVRON_DOWN,
  CHEVRON_RIGHT,
  DEFAULT_BANK,
  DISABLED_CHEVRON_RIGHT,
  OTHER_GATEWAY,
} from 'constants/icons';
import { DISPLAY_CONFIG_CELL_TYPE, DisplayConfigStyleType } from 'modules/widgets/displayConfig/displayConfig.types';
import {
  BANK_NAME_ICON_MAPPING,
  getReconStatusIcon,
  RECON_BANK_ICONS_MAPPING,
  RECON_STATUS_TYPES,
  ROOT_LEVEL_TITLE,
} from 'modules/widgets/Pivot/pivot.constants';
import { formatRowTitleValue, shouldAllowExpandingRow } from 'modules/widgets/Pivot/pivot.utils';
import Image from 'next/image';
import { MapAny } from 'types/commonTypes';
import { cn } from 'utils/common';
import { getCellStyle } from '@/modules/widgets/displayConfig/DisplayConfig';

interface PivotRowTitleProps {
  node: IRowNode;
  value: string;
  maxGroupingLevel?: number;
  displayConfig?: MapAny;
  childIndex?: number;
  displayConfigStyle?: DisplayConfigStyleType;
}

const PivotRowTitle: FC<PivotRowTitleProps> = ({
  value,
  node,
  maxGroupingLevel,
  displayConfig,
  childIndex,
  displayConfigStyle,
}) => {
  const [expanded, setExpanded] = useState(node?.expanded || false);
  const allowExpanding = shouldAllowExpandingRow(node);
  const { show_recon_icons, show_bank_icons } = displayConfig || {};

  const isLowestLevel = node?.level === maxGroupingLevel;
  const isTopLevel = node?.level === 0;
  const isRootLevel = node?.level === -1;

  const formattedValue = formatRowTitleValue(
    show_bank_icons && isTopLevel ? BANK_NAME_ICON_MAPPING[value]?.name : value,
  );

  useEffect(() => {
    const updateExpandState = () => setExpanded(node?.expanded || false);

    node?.addEventListener?.('expandedChanged', updateExpandState);

    return () => node?.removeEventListener?.('expandedChanged', updateExpandState);
  }, [node]);

  const paddingLeft = `${node?.level * (isLowestLevel ? 46 : 28) + 24}px`;

  const resultantConfigStyles = getCellStyle({
    node: node,
    level: node?.level,
    childIndex: childIndex,
    value: value,
    rowParentFieldGreaterByOne: node?.parent?.key,
    rowGroupField: node?.key,
    cellType: DISPLAY_CONFIG_CELL_TYPE.ROW_TITLE_CELL,
    displayConfigStyle: displayConfigStyle,
  });

  return (
    <div
      className={cn(
        'border-b-0.5 border-r-0.5 border-GRAY_400 z-10 flex h-full w-full items-center gap-2',
        allowExpanding && 'cursor-pointer',
        isLowestLevel && 'bg-BG_GRAY_1',
        isRootLevel && 'bg-BG_GRAY_1 justify-end gap-1 border-b-0 pr-3',
      )}
      style={{
        paddingLeft,
        willChange: 'transform',
        ...resultantConfigStyles,
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

      {show_recon_icons && isTopLevel && (
        <Image
          src={getReconStatusIcon(value as RECON_STATUS_TYPES)}
          alt={value ?? 'recon-status'}
          width={18}
          height={18}
          priority
        />
      )}

      {show_bank_icons && isTopLevel && (
        <Image
          src={BANK_NAME_ICON_MAPPING[value]?.icon ?? DEFAULT_BANK}
          alt={value ?? 'Bank'}
          width={18}
          height={18}
          priority
        />
      )}

      {show_recon_icons && isLowestLevel && (
        <Image
          src={RECON_BANK_ICONS_MAPPING[value as keyof typeof RECON_BANK_ICONS_MAPPING] ?? OTHER_GATEWAY}
          alt={value ?? 'other'}
          width={18}
          height={18}
          priority
          className='ml-1.5'
        />
      )}

      <span
        className='f-13-550 text-GRAY_950 max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap'
        title={formattedValue}
      >
        {isRootLevel ? ROOT_LEVEL_TITLE : formattedValue}
      </span>

      {isRootLevel && <Image src={ARROW_RIGHT} alt='arrow-right' width={18} height={18} priority />}
    </div>
  );
};

export default PivotRowTitle;
