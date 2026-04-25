'use client';

import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
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
import { ChevronDown, Plus } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import ScopeCheckboxItem from '@/modules/integrations/AllIntegrations/ScopeCheckboxItem';
import type { ConnectIntegrationDialogPropsType } from '@/modules/integrations/types/integrations.types';
import { getNameInitial } from '@/utils/common';

const ConnectIntegrationDialog: FC<ConnectIntegrationDialogPropsType> = ({
  integrationName,
  integrationTitle,
  integrationIcon,
  isOpen,
  isLoading,
  onOpenChange,
  onConnect,
  defaultScopes = [],
  showScopesOption = false,
}) => {
  // refs
  const connectionNameInputRef = useRef<HTMLInputElement>(null);

  // state
  const [newScope, setNewScope] = useState('');
  const [imgError, setImgError] = useState(false);
  const [allScopes, setAllScopes] = useState<string[]>([]);
  const [connectionName, setConnectionName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());

  const resetFields = useCallback(() => {
    setConnectionName('');
    setNewScope('');
    setImgError(false);
  }, []);

  const initializeScopes = useCallback(() => {
    if (defaultScopes.length > 0) {
      setAllScopes([...defaultScopes]);
      setSelectedScopes(new Set(defaultScopes));
    } else {
      setAllScopes([]);
      setSelectedScopes(new Set());
    }
  }, [defaultScopes]);

  const handleConnect = useCallback(() => {
    const finalScopes = allScopes.filter((s) => selectedScopes.has(s));

    onConnect({
      name: connectionName.trim(),
      scopes: finalScopes.length > 0 ? finalScopes : undefined,
    });
  }, [onConnect, connectionName, allScopes, selectedScopes]);

  const handleToggleScope = useCallback((scope: string) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);

      if (next.has(scope)) {
        next.delete(scope);
      } else {
        next.add(scope);
      }

      return next;
    });
  }, []);

  const handleAddScope = useCallback(() => {
    const trimmed = newScope.trim();

    if (!trimmed) return;

    if (allScopes.includes(trimmed)) {
      if (!selectedScopes.has(trimmed)) {
        setSelectedScopes((prev) => new Set(prev).add(trimmed));
        toast.success('Scope enabled');
      } else {
        toast.error('Scope already exists');
      }

      setNewScope('');

      return;
    }

    setAllScopes((prev) => [...prev, trimmed]);
    setSelectedScopes((prev) => new Set(prev).add(trimmed));
    setNewScope('');
  }, [newScope, allScopes, selectedScopes]);

  const handleScopeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ENTER) {
        e.preventDefault();
        handleAddScope();
      }
    },
    [handleAddScope],
  );

  useEffect(() => {
    if (isOpen) {
      initializeScopes();
      // Radix Dialog grabs focus on open; defer to next frame so our focus sticks.
      requestAnimationFrame(() => connectionNameInputRef.current?.focus());
    } else {
      resetFields();
    }
  }, [isOpen, initializeScopes, resetFields]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-BG_WHITE w-[460px] max-w-[460px]'
        title={`New connection for ${integrationTitle}`}
        description='Set up a new connection for this integration'
        showCloseButton
      >
        <DialogHeader>
          <DialogHeaderTitle className='f-14-550 text-GRAY_1000 flex items-center gap-2'>
            <span>New connection for</span>
            <span className='relative flex h-5 w-5 shrink-0 items-center justify-center'>
              {imgError || !integrationIcon ? (
                <span className='bg-GRAY_200 text-GRAY_700 f-11-550 flex h-full w-full items-center justify-center rounded'>
                  {getNameInitial(integrationTitle)}
                </span>
              ) : (
                <img
                  src={integrationIcon}
                  alt={integrationTitle}
                  className='h-4.5 w-4.5 object-contain'
                  onError={() => setImgError(true)}
                />
              )}
            </span>
            <span>{integrationTitle}</span>
          </DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='flex flex-col gap-y-4 py-4'>
          <div className='flex flex-col gap-y-2 px-4'>
            <label htmlFor={`conn-name-${integrationName}`} className='f-12-500 text-GRAY_1000'>
              Connection name<span className='text-red-700'>*</span>
            </label>
            <Input
              ref={(node) => {
                connectionNameInputRef.current = node;
              }}
              id={`conn-name-${integrationName}`}
              placeholder='Enter connection name'
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className='bg-BG_WHITE'
            />
          </div>

          {showScopesOption && (
            <Accordion type='single' collapsible>
              <AccordionItem value='scopes' className='border-b-0'>
                <AccordionTrigger
                  className='cursor-pointer px-4 py-3 outline-none'
                  icon={ChevronDown}
                  iconRotation={180}
                >
                  <span className='f-13-500 text-GRAY_1000'>
                    Scopes <span className='f-12-400 text-GRAY_600'>(click to configure)</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className='pt-0 pb-0'>
                  <div className='flex flex-col gap-y-3'>
                    <div className='flex items-center gap-2 px-4'>
                      <Input
                        placeholder='Add scope link here'
                        value={newScope}
                        onChange={(e) => setNewScope(e.target.value)}
                        onKeyDown={handleScopeKeyDown}
                        size='small'
                        wrapperClassName='flex-1'
                        className='bg-BG_WHITE'
                      />
                      <Button
                        variant='outline'
                        size='small'
                        onClick={handleAddScope}
                        disabled={!newScope.trim()}
                        className='h-8 gap-1'
                      >
                        <Plus className='h-3.5 w-3.5' />
                        Add
                      </Button>
                    </div>

                    {allScopes.length > 0 && (
                      <ScrollContainer className='max-h-52' scrollbarStyle='thin'>
                        <div className='flex flex-col gap-y-2 px-4 pb-2'>
                          {allScopes.map((scope) => (
                            <ScopeCheckboxItem
                              key={scope}
                              scope={scope}
                              checked={selectedScopes.has(scope)}
                              onToggle={handleToggleScope}
                            />
                          ))}
                        </div>
                      </ScrollContainer>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </DialogBody>
        <DialogFooter>
          <Button size='small' isLoading={isLoading} disabled={!connectionName.trim()} onClick={handleConnect}>
            Setup connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectIntegrationDialog;
