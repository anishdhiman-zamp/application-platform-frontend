'use client';

import { type FC, useCallback, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Input,
} from '@zamp-platform/ui';
import { Settings2 } from 'lucide-react';

interface ConnectIntegrationDialogProps {
  integrationName: string;
  integrationTitle: string;
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (payload: { name: string; description: string }) => void;
  scopesCount?: number;
  onConfigureScopes?: () => void;
  showScopesOption?: boolean;
}

const ConnectIntegrationDialog: FC<ConnectIntegrationDialogProps> = ({
  integrationName,
  integrationTitle,
  isOpen,
  isLoading,
  onOpenChange,
  onConnect,
  scopesCount = 0,
  onConfigureScopes,
  showScopesOption = false,
}) => {
  const [connectionName, setConnectionName] = useState('');
  const [connectionDescription, setConnectionDescription] = useState('');

  const resetFields = useCallback(() => {
    setConnectionName('');
    setConnectionDescription('');
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange(open);

      if (!open) {
        resetFields();
      }
    },
    [onOpenChange, resetFields],
  );

  const handleConnect = useCallback(() => {
    onConnect({
      name: connectionName.trim(),
      description: connectionDescription.trim(),
    });
  }, [onConnect, connectionName, connectionDescription]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className='bg-BG_WHITE w-[400px] max-w-[400px]'
        title={`Connect ${integrationTitle}`}
        description='Provide a name and description for this connection'
        showCloseButton
      >
        <DialogHeader>
          <DialogHeaderTitle>Connect {integrationTitle}</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='flex flex-col gap-y-4 p-4'>
          <div className='flex flex-col gap-y-1.5'>
            <label htmlFor={`conn-name-${integrationName}`} className='f-12-500 text-GRAY_1000'>
              Title<span className='text-red-700'>*</span>
            </label>
            <Input
              id={`conn-name-${integrationName}`}
              placeholder='Enter connection name'
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className='bg-BG_WHITE'
            />
          </div>
          <div className='flex flex-col gap-y-1.5'>
            <label htmlFor={`conn-desc-${integrationName}`} className='f-12-500 text-GRAY_1000'>
              Description
            </label>
            <Input
              id={`conn-desc-${integrationName}`}
              placeholder='Enter description'
              value={connectionDescription}
              onChange={(e) => setConnectionDescription(e.target.value)}
              className='bg-BG_WHITE'
            />
          </div>
          {showScopesOption && onConfigureScopes && (
            <button
              type='button'
              onClick={onConfigureScopes}
              className='text-GRAY_600 hover:text-GRAY_900 f-12-400 flex cursor-pointer items-center gap-1.5 self-start transition-colors'
            >
              <Settings2 className='h-3.5 w-3.5' />
              {scopesCount > 0 ? `${scopesCount} scope${scopesCount !== 1 ? 's' : ''} configured` : 'Configure scopes'}
            </button>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant='outline' size='small' onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button size='small' isLoading={isLoading} disabled={!connectionName.trim()} onClick={handleConnect}>
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectIntegrationDialog;
