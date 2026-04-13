'use client';

import { useCallback } from 'react';
import { Dialog, DialogContent } from '@zamp-platform/ui';
import AddConnectionModalContent from 'modules/pace/components/agents/components/AddConnectionModalContent';
import { APITags } from '@/constants/api.constants';
import { useAppDispatch } from '@/hooks/toolkit';
import { IntegrationsProvider } from '@/modules/integrations/AllIntegrations/Integrations.context';
import { baseApi } from '@/services/baseApi';

interface AddConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
}

const AddConnectionModal = ({ open, onOpenChange, agentId }: AddConnectionModalProps) => {
  const dispatch = useAppDispatch();

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        dispatch(baseApi.util.invalidateTags([{ type: APITags.GET_AGENT_CONNECTIONS, id: agentId }]));
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, dispatch, agentId],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className='@container flex h-[80vh] max-w-[900px] flex-col gap-0 overflow-hidden rounded-2xl p-0'
        showCloseButton
        title='Add connection'
        description='Browse and connect integrations'
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <IntegrationsProvider>
          <AddConnectionModalContent />
        </IntegrationsProvider>
      </DialogContent>
    </Dialog>
  );
};

export default AddConnectionModal;
