/**
 * Custom hook for dialog state management
 * Separates state management from UI components (SRP)
 */

import { useCallback, useState } from 'react';
import { ConnectionType } from '@/types/api/integrations';

export type DialogIntent = { type: 'connections'; connections: ConnectionType[] } | { type: 'create' } | null;

export const useDialogState = () => {
  const [dialogIntent, setDialogIntent] = useState<DialogIntent>(null);

  const openConnectionsDialog = useCallback((connections: ConnectionType[]) => {
    setDialogIntent({ type: 'connections', connections });
  }, []);

  const openCreateDialog = useCallback(() => {
    setDialogIntent({ type: 'create' });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogIntent(null);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
    },
    [closeDialog],
  );

  return {
    dialogIntent,
    openConnectionsDialog,
    openCreateDialog,
    closeDialog,
    handleDialogOpenChange,
  };
};
