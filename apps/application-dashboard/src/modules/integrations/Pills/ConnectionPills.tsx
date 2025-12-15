'use client';

import type { FC } from 'react';
import { CONNECTION_PILLS_DETAILS, PILLS_CONFIG } from '@/modules/integrations/constants/integrations.constant';
import ConnectionPill from '@/modules/integrations/Pills/ConnectionPill';

interface ConnectionPillsProps {
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ConnectionPills: FC<ConnectionPillsProps> = ({ onMouseEnter, onMouseLeave, onClick }) => {
  return (
    <div
      className='flex gap-x-1.5 select-none'
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      data-testid='connection-pills'
    >
      {PILLS_CONFIG.map((config) => (
        <ConnectionPill key={config.type} config={config} details={CONNECTION_PILLS_DETAILS[config.type]} />
      ))}
    </div>
  );
};

export default ConnectionPills;
