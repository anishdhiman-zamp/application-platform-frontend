'use client';

import type { FC } from 'react';
import ConnectionPill from 'modules/integrations/components/pills/ConnectionPill';
import { CONNECTION_PILLS_DETAILS, PILLS_CONFIG } from 'modules/integrations/integrations.constant';

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
