import type { FC } from 'react';
import IntegrationSearchInput from 'modules/integrations/AllIntegrations/IntegrationSearchInput';
import McpConnectionDialog from 'modules/integrations/components/McpConnectionDialog';

const IntegrationHeader: FC = () => {
  return (
    <div className='flex flex-col items-start gap-y-4 px-10'>
      <h1 className='f-20-600 text-GRAY_1000'>Integrations</h1>

      <div className='flex w-full items-center justify-between'>
        <IntegrationSearchInput />
        <McpConnectionDialog />
      </div>
    </div>
  );
};

export default IntegrationHeader;
