import {
  Button,
  CopyToClipboard,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@zamp-platform/ui';
import { Link, Plus } from 'lucide-react';
import ConnectionList from 'modules/process/knowledge-base-creation/components/ConnectionList';
import { TriggerChip, TriggerItem } from 'modules/process/knowledge-base-creation/components/TriggerItem';
import { useIntegrationItem } from 'modules/process/knowledge-base-creation/hooks/useIntegrationItem';
import { MappedIntegrationType } from 'modules/process/knowledge-base-creation/utils/buildMappedIntegrationsList';
import ConnectionModal from '@/modules/integrations/components/ConnectionModal';
import { preventAutoFocus } from '@/utils/common';

const IntegrationItem = ({ mappedIntegration }: { mappedIntegration: MappedIntegrationType }) => {
  const {
    open,
    setOpen,
    filteredCombinedTriggers,
    dialogIntent,
    connectionsToAdd,
    isCreatingProcessConnectionMapping,
    handleRemoveConnection,
    handleOpenDeleteDialog,
    handleAddConnection,
    handleConnectWrapper,
    handleListOpenChange,
    handleCloseDeleteDialog,
    handleAddAnother,
    handleCreateConnectionMapping,
  } = useIntegrationItem({ mappedIntegration });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className='cursor-pointer'>
          <div className='f-12-450 flex items-center gap-0.5'>
            <TriggerChip
              text={mappedIntegration.integration.display_name}
              logo={mappedIntegration.integration.logo}
              isFirst
            />
            <div className='flex h-6 items-center gap-1 rounded-r bg-gray-100 px-2'>
              <Link size={14} className='text-gray-900' />
              <span>{mappedIntegration.number_of_connections}</span>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent onCloseAutoFocus={preventAutoFocus} className='p-0'>
          <div className='p-1'>
            {mappedIntegration.connections?.map((connection) => (
              <DropdownMenuItem
                key={connection.id}
                className='group f-13-500 flex cursor-default items-center justify-between rounded-md p-0 hover:bg-gray-50'
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className='h-full min-w-0 flex-1 [&>span]:block [&>span]:h-full [&>span]:w-full'
                >
                  <CopyToClipboard text={connection.name}>
                    <div className='group-hover:text-gray-1000 flex h-full w-full items-center py-2 pl-2'>
                      {connection.name}
                    </div>
                  </CopyToClipboard>
                </div>
                <Button
                  variant='outline'
                  size='xsmall'
                  onClick={() => {
                    handleOpenDeleteDialog(connection);
                  }}
                  className='my-2 mr-2'
                >
                  Remove
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuItem className='border-t px-0.5 py-1'>
            <Button
              variant='ghost'
              size='xsmall'
              onClick={handleAddConnection}
              leadingIcon={<Plus size={12} />}
              className='w-full justify-start hover:bg-transparent'
            >
              Account
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size='small' showCloseButton className='w-[400px]' id='delete-page-dialog'>
          <DialogHeader className='border-none'>
            <DialogHeaderTitle>Delete Connection</DialogHeaderTitle>
          </DialogHeader>
          <DialogBody className='f-14-400 px-5 pt-0 pb-5'>
            <span>Are you sure you want to delete this connection? This action cannot be undone.</span>
            {filteredCombinedTriggers.length > 0 && <span>This will also delete all associated triggers.</span>}
            {filteredCombinedTriggers.length > 0 && (
              <div className='mt-2 space-y-2'>
                {filteredCombinedTriggers.map((trigger) => (
                  <TriggerItem
                    key={trigger.id}
                    trigger={trigger}
                    hideDeleteButton
                    connectionNameClassName='max-w-[200px]'
                  />
                ))}
              </div>
            )}
          </DialogBody>
          <DialogFooter className='flex justify-end gap-2.5'>
            <DialogClose asChild>
              <Button variant='secondary'>Cancel</Button>
            </DialogClose>
            <Button variant='destructive' onClick={handleRemoveConnection}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConnectionList
        isOpen={dialogIntent?.type === 'connections'}
        onOpenChange={handleListOpenChange}
        onConnect={handleConnectWrapper}
        onAddAnother={handleAddAnother}
        integrationName={mappedIntegration.integration.display_name || ''}
        connections={connectionsToAdd}
        isLoading={isCreatingProcessConnectionMapping}
      />
      <ConnectionModal
        integration={mappedIntegration.integration}
        isOpen={dialogIntent?.type === 'create'}
        onClose={handleCloseDeleteDialog}
        onSubmit={handleCreateConnectionMapping}
        isCreatingTrigger={isCreatingProcessConnectionMapping}
      />
    </>
  );
};

export default IntegrationItem;
