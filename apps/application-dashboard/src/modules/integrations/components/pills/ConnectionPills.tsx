'use client';

import type { FC } from 'react';
import { Link2, RefreshCcw, Unlink } from 'lucide-react';
import ConnectionPill from 'modules/integrations/components/pills/ConnectionPill';
import { CONNECTION_PILLS_DETAILS } from 'modules/integrations/integrations.constant';
import { CONNECTION_PILLS_TYPE, type PillConfig } from 'modules/integrations/integrations.types';

const PILLS_CONFIG: PillConfig[] = [
  {
    type: CONNECTION_PILLS_TYPE.SYNCED,
    icon: <Link2 width={14} height={14} className='-rotate-45 p-[2px]' />,
    tooltipWidth: 'w-30',
  },
  {
    type: CONNECTION_PILLS_TYPE.REAUTH,
    icon: <RefreshCcw width={14} height={14} className='p-[2px]' />,
    tooltipWidth: 'w-32',
  },
  {
    type: CONNECTION_PILLS_TYPE.DISCONNECTED,
    icon: <Unlink width={14} height={14} className='p-[2px]' />,
    tooltipWidth: 'w-30',
  },
];

const ConnectionPills: FC = () => {
  return (
    <div className='flex gap-x-1.5 select-none'>
      {PILLS_CONFIG.map((config) => (
        <ConnectionPill key={config.type} config={config} details={CONNECTION_PILLS_DETAILS[config.type]} />
      ))}
    </div>
  );
};

export default ConnectionPills;
