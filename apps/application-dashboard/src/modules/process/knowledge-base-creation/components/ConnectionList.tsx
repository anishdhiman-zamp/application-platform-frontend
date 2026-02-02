'use client';

import { type FC } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Radio,
  RadioGroup,
} from '@zamp-platform/ui';
import { withArticle } from '@zamp-platform/utils';
import { useConnectionList } from 'modules/process/knowledge-base-creation/hooks/useConnectionList';
import { ConnectionType } from '@/types/api/integrations';

interface ConnectionListProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (selectedConnection: ConnectionType) => void;
  onAddAnother: () => void;
  connections: ConnectionType[];
  isLoading?: boolean;
  integrationName: string;
  isTriggerSelector?: boolean;
}

const ConnectionList: FC<ConnectionListProps> = ({
  isOpen,
  onOpenChange,
  onConnect,
  onAddAnother,
  connections,
  isLoading = false,
  integrationName,
  isTriggerSelector = false,
}) => {
  const { selectedConnection, handleConnectionChange, handleConnect } = useConnectionList({
    connections,
    onConnect,
  });

  const lowerIntegrationName = integrationName.toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]'>
        <DialogHeader className='border-none px-5'>
          <DialogHeaderTitle>Connect {withArticle(integrationName)} account</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='px-5 pb-6'>
          <p className='f-13-450 mb-2 text-gray-900'>
            Choose which {lowerIntegrationName} account you'd like to use {isTriggerSelector ? 'for this trigger' : ''}
          </p>
          <RadioGroup value={selectedConnection?.id} onValueChange={handleConnectionChange}>
            {connections.map((connection) => (
              <div
                key={connection.id}
                className='flex cursor-pointer items-center gap-3'
                onClick={() => handleConnectionChange(connection.id)}
              >
                <Radio value={connection.id} id={`connection-${connection.id}`} />
                <span className='f-13-450 text-gray-900'>{connection.name}</span>
              </div>
            ))}
          </RadioGroup>
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <Button variant='secondary' size='medium' onClick={onAddAnother}>
            Add another
          </Button>
          <Button
            variant='default'
            size='medium'
            onClick={handleConnect}
            isLoading={isLoading}
            disabled={!selectedConnection}
          >
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionList;
