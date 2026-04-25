'use client';

import { TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import {
  ACCESS_LEVEL,
  type AccessLevelOptionType,
  type AccessLevelType,
} from 'modules/pace/components/agents/types/agents.types';

interface AccessLevelOptionPropsType {
  option: AccessLevelOptionType;
  isSelected: boolean;
  onSelect: (value: AccessLevelType) => void;
}

const AccessLevelOption = ({ option, isSelected, onSelect }: AccessLevelOptionPropsType) => {
  const { icon: Icon, label, value } = option;
  const isCustom = value === ACCESS_LEVEL.CUSTOM;

  return (
    <TooltipV2 tooltipBody={label}>
      <div
        role='button'
        onClick={() => onSelect(value)}
        aria-label={label}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-sm transition-colors',
          isSelected && !isCustom && 'bg-GRAY_200 text-GRAY_1000',
          !isSelected && 'text-GRAY_700',
          isCustom && 'cursor-default',
          isCustom && isSelected && 'bg-GRAY_100 text-GRAY_700',
          !isCustom && 'hover:bg-GRAY_100 hover:text-GRAY_1000 cursor-pointer',
        )}
      >
        <Icon size={14} />
      </div>
    </TooltipV2>
  );
};

export default AccessLevelOption;
