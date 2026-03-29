'use client';

import { SettingsRow } from '@/modules/general/components/SettingsRow';
import { DANGER_ZONE_ROWS } from '@/modules/organisation-settings/constants/organisation-settings.constants';

const DangerZone = () => {
  return (
    <div className='flex flex-col'>
      <h1 className='f-20-600 text-GRAY_1000 pt-6 pb-4'>Danger zone</h1>
      <div className='border-GRAY_400 rounded-2xl border'>
        {DANGER_ZONE_ROWS.map(({ key, label, value, actionText }, index) => (
          <SettingsRow
            key={key}
            label={label}
            value={value}
            className={index === DANGER_ZONE_ROWS.length - 1 ? 'border-none' : ''}
            action={{ text: actionText, variant: 'destructive-outline' }}
          />
        ))}
      </div>
    </div>
  );
};

export default DangerZone;
