'use client';

import { type FC, useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Input,
  toast,
} from '@zamp-platform/ui';
import { RotateCcw, Trash2 } from 'lucide-react';

interface ConfigureScopesDialogProps {
  integrationTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onScopesChanged: (scopes: string[]) => void;
  defaultScopes: string[];
  initialScopes?: string[];
}

const ConfigureScopesDialog: FC<ConfigureScopesDialogProps> = ({
  integrationTitle,
  isOpen,
  onOpenChange,
  onScopesChanged,
  defaultScopes,
  initialScopes,
}) => {
  const [scopes, setScopes] = useState<string[]>([]);
  const [newScope, setNewScope] = useState('');

  useEffect(() => {
    if (isOpen) {
      setScopes(initialScopes && initialScopes.length > 0 ? initialScopes : [...defaultScopes]);
    } else {
      setNewScope('');
    }
  }, [isOpen, initialScopes, defaultScopes]);

  const handleResetToDefaults = useCallback(() => {
    setScopes([...defaultScopes]);
  }, [defaultScopes]);

  const handleAddScope = useCallback(() => {
    const trimmed = newScope.trim();

    if (!trimmed) return;

    if (scopes.includes(trimmed)) {
      toast.error('Scope already exists');

      return;
    }
    setScopes((prev) => [...prev, trimmed]);
    setNewScope('');
  }, [newScope, scopes]);

  const handleRemoveScope = useCallback((scope: string) => {
    setScopes((prev) => prev.filter((s) => s !== scope));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddScope();
      }
    },
    [handleAddScope],
  );

  const handleSave = useCallback(() => {
    onScopesChanged(scopes);
  }, [scopes, onScopesChanged]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-BG_WHITE w-[460px] max-w-[460px]'
        title={`Manage Scopes — ${integrationTitle}`}
        description='Add or remove OAuth scopes for this integration'
        showCloseButton
      >
        <DialogHeader>
          <DialogHeaderTitle>Manage Scopes</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='flex flex-col gap-y-3 p-4'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Enter a scope to add'
              value={newScope}
              onChange={(e) => setNewScope(e.target.value)}
              onKeyDown={handleKeyDown}
              className='bg-BG_WHITE flex-1'
            />
            <Button variant='outline' size='small' onClick={handleAddScope} disabled={!newScope.trim()}>
              Add
            </Button>
          </div>

          {scopes.length === 0 && (
            <p className='f-12-400 text-GRAY_600 py-2'>No scopes configured. Add scopes above.</p>
          )}

          {scopes.length > 0 && (
            <div className='flex max-h-[280px] flex-col gap-y-1 overflow-y-auto'>
              {scopes.map((scope) => (
                <div
                  key={scope}
                  className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_GRAY_2 flex items-center justify-between rounded border px-3 py-2'
                >
                  <span className='f-12-400 text-GRAY_1000 min-w-0 flex-1 truncate'>{scope}</span>
                  <button
                    type='button'
                    onClick={() => handleRemoveScope(scope)}
                    className='text-GRAY_600 ml-2 shrink-0 cursor-pointer transition-colors hover:text-red-600'
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter className='justify-between'>
          <Button
            variant='ghost'
            size='small'
            onClick={handleResetToDefaults}
            disabled={defaultScopes.length === 0}
            className='text-GRAY_600 hover:text-GRAY_900 gap-1'
          >
            <RotateCcw className='h-3.5 w-3.5' />
            Reset to defaults
          </Button>
          <div className='flex items-center gap-3'>
            <Button variant='outline' size='small' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size='small' onClick={handleSave}>
              Save Scopes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigureScopesDialog;
