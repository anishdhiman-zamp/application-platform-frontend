'use client';

import { type FC, useCallback } from 'react';
import { ConfirmationDialog } from '@zamp-platform/ui';

interface AutoLoopConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const AutoLoopConfirmDialog: FC<AutoLoopConfirmDialogProps> = ({ isOpen, onOpenChange, onConfirm }) => {
  const handleConfirm = useCallback(() => {
    onOpenChange(false);
    onConfirm();
  }, [onOpenChange, onConfirm]);

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title='Enable Autopilot'
      description='This will switch the conversation to Autopilot mode. Once enabled, it stays on for the rest of this chat and cannot be turned off. You can start a new conversation at any time to go back to the default mode.'
      confirmLabel='Enable'
      confirmVariant='default'
      onConfirm={handleConfirm}
    />
  );
};

export default AutoLoopConfirmDialog;
