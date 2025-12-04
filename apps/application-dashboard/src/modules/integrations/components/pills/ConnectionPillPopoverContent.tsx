import { type FC, useMemo } from 'react';
import { Button, PopoverContent, PopoverPortal } from '@zamp-platform/ui';
import { PILLS_CONFIG } from 'modules/integrations/integrations.constant';
import type { CONNECTION_PILLS_TYPE } from 'modules/integrations/integrations.types';

interface ConnectionPillPopoverContentProps {
  accounts: { id: string; email: string }[];
  action: string;
  type: CONNECTION_PILLS_TYPE;
}

const ConnectionPillPopoverContent: FC<ConnectionPillPopoverContentProps> = ({ accounts, action, type }) => {
  const pillConfig = useMemo(() => PILLS_CONFIG.find((config) => config.type === type), [type]);

  return (
    <PopoverPortal>
      <PopoverContent className='border-GRAY_500 flex max-h-[150px] min-w-[256px] flex-col overflow-y-auto rounded-md border-[0.5px] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {accounts.map((account) => (
          <div
            key={account.id}
            className='hover:bg-GRAY_50 flex items-center justify-between gap-x-1.5 rounded-md px-2.5 py-2'
          >
            {pillConfig?.icon}
            <span className='f-12-500 flex-1 text-left'>{account.email}</span>
            <Button
              variant='outline'
              size='xsmall'
              className='f-11-500 bg-white px-2.5 py-1.5 capitalize hover:bg-white'
            >
              {action}
            </Button>
          </div>
        ))}
      </PopoverContent>
    </PopoverPortal>
  );
};

export default ConnectionPillPopoverContent;
