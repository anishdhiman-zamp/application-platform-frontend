'use client';

import { type FC, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  Input,
  ScrollContainer,
  toast,
} from '@zamp-platform/ui';
import { RotateCcw } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';

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
  const [allScopes, setAllScopes] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [newScope, setNewScope] = useState('');

  const handleToggleScope = (scope: string) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);

      if (next.has(scope)) {
        next.delete(scope);
      } else {
        next.add(scope);
      }

      return next;
    });
  };

  const handleAddScope = () => {
    const trimmed = newScope.trim();

    if (!trimmed) return;

    if (allScopes.includes(trimmed)) {
      if (!selectedScopes.has(trimmed)) {
        setSelectedScopes((prev) => new Set(prev).add(trimmed));
      } else {
        toast.error('Scope already exists');
      }

      setNewScope('');

      return;
    }

    setAllScopes((prev) => [...prev, trimmed]);
    setSelectedScopes((prev) => new Set(prev).add(trimmed));
    setNewScope('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault();
      handleAddScope();
    }
  };

  const handleResetToDefaults = () => {
    setAllScopes([...defaultScopes]);
    setSelectedScopes(new Set(defaultScopes));
  };

  const handleSave = () => {
    onScopesChanged(allScopes.filter((s) => selectedScopes.has(s)));
  };

  useEffect(() => {
    if (isOpen) {
      if (initialScopes && initialScopes.length > 0) {
        const merged = Array.from(new Set([...defaultScopes, ...initialScopes]));

        setAllScopes(merged);
        setSelectedScopes(new Set(initialScopes));
      } else {
        setAllScopes([...defaultScopes]);
        setSelectedScopes(new Set(defaultScopes));
      }
    } else {
      setNewScope('');
    }
  }, [isOpen, initialScopes, defaultScopes]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-BG_WHITE w-115 max-w-115'
        title={`Manage Scopes — ${integrationTitle}`}
        description='Select which OAuth scopes to request for this integration'
        showCloseButton
      >
        <DialogHeader>
          <DialogHeaderTitle>Manage Scopes</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='flex flex-col gap-y-3 p-4'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Add a custom scope'
              value={newScope}
              onChange={(e) => setNewScope(e.target.value)}
              onKeyDown={handleKeyDown}
              size='small'
              wrapperClassName='flex-1'
              className='bg-BG_WHITE'
            />
            <Button variant='outline' size='small' onClick={handleAddScope} disabled={!newScope.trim()} className='h-8'>
              Add
            </Button>
          </div>

          {allScopes.length === 0 && (
            <p className='f-12-400 text-GRAY_600 py-2'>No scopes available. Add a custom scope above.</p>
          )}

          {allScopes.length > 0 && (
            <>
              <label className='flex cursor-pointer items-center gap-2 px-1'>
                <Checkbox
                  checked={selectedScopes.size === allScopes.length}
                  onCheckedChange={(checked) => {
                    setSelectedScopes(checked ? new Set(allScopes) : new Set());
                  }}
                />
                <span className='f-12-500 text-GRAY_700'>
                  {selectedScopes.size === allScopes.length ? 'Deselect all' : 'Select all'}
                </span>
              </label>
              <ScrollContainer className='max-h-70' scrollbarStyle='thin'>
                <div className='flex flex-col gap-y-1'>
                  {allScopes.map((scope) => (
                    <label
                      key={scope}
                      className='border-GRAY_400 bg-BG_WHITE hover:bg-BG_GRAY_2 flex h-8 cursor-pointer items-center gap-2.5 rounded border px-3'
                    >
                      <Checkbox checked={selectedScopes.has(scope)} onCheckedChange={() => handleToggleScope(scope)} />
                      <span className='f-12-400 text-GRAY_1000 min-w-0 flex-1 truncate'>{scope}</span>
                    </label>
                  ))}
                </div>
              </ScrollContainer>
            </>
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
