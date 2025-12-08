import { type FC, type ReactNode } from 'react';
import { Button } from '@zamp-platform/ui';
import ProcessCards from 'modules/integrations/components/integration-detail/ProcessCards';
import { STATUS_CONFIG } from 'modules/integrations/integrations.constant';
import { type AccountStatus } from 'modules/integrations/integrations.types';
import type { defaultFnType } from '@/types/commonTypes';

export interface AccountSectionProps {
  accountEmail: string;
  status: AccountStatus;
  processCards?: ReactNode;
  onActionClick?: defaultFnType;
}

const AccountSection: FC<AccountSectionProps> = ({ accountEmail, status, processCards, onActionClick }) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <div className='flex items-center justify-between'>
        {/* Account Name with optional status icon */}
        <div className={`flex items-center gap-x-1.5 ${config.labelClassName}`}>
          <span className='f-12-450'>{accountEmail}</span>
          {config.icon}
        </div>

        {/* Action Button */}
        <Button variant='outline' size='small' className='gap-x-1.5 px-2.5 py-1.5' onClick={onActionClick}>
          {config.actionIcon}
          {config.actionLabel}
        </Button>
      </div>

      {/* Process cards - either custom or default */}
      {processCards ?? (
        <div className='grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3'>
          <ProcessCards />
          <ProcessCards />
          <ProcessCards />
        </div>
      )}
    </div>
  );
};

export default AccountSection;
