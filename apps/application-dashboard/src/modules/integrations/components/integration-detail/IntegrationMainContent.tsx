import { type FC } from 'react';
import AccountSection from 'modules/integrations/components/integration-detail/AccountSection';
import { ACCOUNT_STATUS, type AccountStatus } from 'modules/integrations/integrations.types';

interface AccountData {
  id: string;
  email: string;
  status: AccountStatus;
}

// TODO: Replace with actual data from API
const MOCK_ACCOUNTS: AccountData[] = [
  { id: '1', email: 'admin@zamp.ai', status: ACCOUNT_STATUS.CONNECTED },
  { id: '2', email: 'admin@zamp.ai', status: ACCOUNT_STATUS.ARCHIVED },
  { id: '3', email: 'admin@zamp.ai', status: ACCOUNT_STATUS.NEEDS_REAUTH },
  { id: '4', email: 'admin@zamp.ai', status: ACCOUNT_STATUS.DISCONNECTED },
];

interface IntegrationMainContentProps {
  accounts?: AccountData[];
}

const IntegrationMainContent: FC<IntegrationMainContentProps> = ({ accounts = MOCK_ACCOUNTS }) => {
  const handleAccountAction = (accountId: string, status: AccountStatus) => {
    // TODO: Implement action handlers based on status
    console.log(`Action triggered for account ${accountId} with status ${status}`);
  };

  return (
    <div className='flex w-full flex-1 flex-col gap-y-8'>
      {accounts.map((account) => (
        <AccountSection
          key={account.id}
          accountEmail={account.email}
          status={account.status}
          onActionClick={() => handleAccountAction(account.id, account.status)}
        />
      ))}
    </div>
  );
};

export default IntegrationMainContent;
