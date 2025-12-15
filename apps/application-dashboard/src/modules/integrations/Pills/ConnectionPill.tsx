'use client';

import type { FC } from 'react';
import { Button, Popover, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import TooltipV2 from '@/components/common/TooltipV2';
import { PILL_STYLE_MAP } from '@/modules/integrations/constants/integrations.constant';
import usePopoverWithTooltip from '@/modules/integrations/hooks/usePopoverWithTooltip';
import ConnectionPillPopoverContent from '@/modules/integrations/Pills/ConnectionPillPopoverContent';
import ConnectionPillTooltipContent from '@/modules/integrations/Pills/ConnectionPillTooltipContent';
import type { ConnectionPillsDetails, PillConfig } from '@/modules/integrations/types/integrations.types';
import { SIDE_OPTIONS } from '@/types/commonTypes';

interface ConnectionPillProps {
  config: PillConfig;
  details: ConnectionPillsDetails;
}

const ConnectionPill: FC<ConnectionPillProps> = ({ config, details }) => {
  const { open, handleOpenChange, tooltipDisabled } = usePopoverWithTooltip();
  const { type, icon, tooltipWidth } = config;
  const { title, accounts, action } = details;

  return (
    <TooltipV2
      tooltipBody={<ConnectionPillTooltipContent title={title} />}
      side={SIDE_OPTIONS.BOTTOM}
      asChildTrigger
      tooltipClassName={cn('px-3 py-2', tooltipWidth)}
      disabled={tooltipDisabled}
    >
      <div className='inline-flex'>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant='ghost' size='small' className={cn(PILL_STYLE_MAP[type], open && 'bg-GRAY_100')}>
              {icon}
              {accounts?.length}
            </Button>
          </PopoverTrigger>
          <ConnectionPillPopoverContent accounts={accounts} action={action} type={type} />
        </Popover>
      </div>
    </TooltipV2>
  );
};

export default ConnectionPill;
