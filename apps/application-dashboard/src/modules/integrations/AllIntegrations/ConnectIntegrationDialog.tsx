'use client';

import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import MultiSelectInput from '@/components/multiSelectInput/MultiSelectInput';
import type { ArrayListOption } from '@/components/multiSelectInput/multiSelectInput.types';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { useAppSelector } from '@/hooks/toolkit';
import ScopeCheckboxItem from '@/modules/integrations/AllIntegrations/ScopeCheckboxItem';
import { ROLE_OPTIONS } from '@/modules/integrations/constants/integrations.constant';
import { useShareableAudiences } from '@/modules/integrations/IntegrationDetail/useShareableAudiences';
import {
  type ConnectIntegrationDialogAudience,
  type ConnectIntegrationDialogPropsType,
  type ConnectIntegrationDialogTypedAudience,
  CONNECTION_ROLE,
  type ConnectionRoleType,
} from '@/modules/integrations/types/integrations.types';
import type { RootState } from '@/store';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { getNameInitial } from '@/utils/common';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // states
  const [search, setSearch] = useState('');
  const [newScope, setNewScope] = useState('');
  const [imgError, setImgError] = useState(false);
  const [connectionName, setConnectionName] = useState('');
  const [allScopes, setAllScopes] = useState<string[]>([]);
  const [showValidationError, setShowValidationError] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ArrayListOption[]>([]);
  const [role, setRole] = useState<ConnectionRoleType>(CONNECTION_ROLE.ADMIN);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';

  const selectedIds = useMemo(() => {
    const ids = new Set<string>();

    selectedItems.forEach((item) => {
      const id = item?.resource_audience_id ?? item?.value;

      if (id) ids.add(id);
    });

    return ids;
  }, [selectedItems]);

  const { allKnownOptions, optionsList } = useShareableAudiences({
    organizationId,
    enabled: isOpen,
    selectedIds,
  });

  const resetFields = useCallback(() => {
    setConnectionName('');
    setNewScope('');
    setImgError(false);
    setSearch('');
    setSelectedItems([]);
    setShowValidationError(false);
    setRole(CONNECTION_ROLE.ADMIN);
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

  const buildValidAudiences = useCallback((): ConnectIntegrationDialogAudience[] => {
    return selectedItems
      .filter((item) => item?.valid && (item?.resource_audience_id ?? item?.value))
      .map((item) => {
        const audienceType = item.resource_audience_type ?? ResourceAudienceType.USER;
        // Agents are sent as `user` audience type to the share endpoint.
        const isAgent = audienceType === ResourceAudienceType.AGENT;

        return {
          audience_type: isAgent ? ResourceAudienceType.USER : audienceType,
          audience_id: (item.resource_audience_id ?? item.value) as string,
          role,
        };
      });
  }, [selectedItems, role]);

  const handleConnect = useCallback(() => {
    const finalScopes = allScopes.filter((s) => selectedScopes.has(s));
    const validAudiences = buildValidAudiences();

    onConnect({
      name: connectionName.trim(),
      scopes: finalScopes.length > 0 ? finalScopes : undefined,
      audiences: validAudiences.length > 0 ? validAudiences : undefined,
    });
  }, [onConnect, connectionName, allScopes, selectedScopes, buildValidAudiences]);

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

  const handleOptionSelection = useCallback((option: { value: string; label: string; type?: string }) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        value: option.value,
        label: option.label,
        valid: true,
        resource_audience_type: option.type ?? ResourceAudienceType.AGENT,
        resource_audience_id: option.value,
      },
    ]);
    setSearch('');
  }, []);

  const handleAddFromDropdown = useCallback(
    (option: { value: string; label: string; type: string }) => {
      if (selectedIds.has(option.value)) {
        toast.info('Already added');

        return;
      }
      handleOptionSelection(option);
    },
    [selectedIds, handleOptionSelection],
  );

  const findExactMatch = useCallback(
    (typedValue: string) => {
      const typed = typedValue.trim().toLowerCase();

      if (!typed) return undefined;

      return allKnownOptions.find((opt) => {
        const optLabel = opt?.label?.toLowerCase() ?? '';
        const optEmail = opt?.email?.toLowerCase() ?? '';

        return optLabel === typed || optEmail === typed;
      });
    },
    [allKnownOptions],
  );

  const handleAddFreeText = useCallback((value: string, label: string) => {
    const isValid = EMAIL_REGEX.test(value);

    setSelectedItems((prev) => [
      ...prev,
      {
        value,
        label,
        valid: isValid,
        resource_audience_type: ResourceAudienceType.USER,
        resource_audience_id: value,
      },
    ]);

    if (!isValid) setShowValidationError(true);
  }, []);

  const handleValidateAndAdd = useCallback(
    ({ value, label, type }: ConnectIntegrationDialogTypedAudience) => {
      if (!value) return;

      // From dropdown — use directly.
      if (type) {
        handleAddFromDropdown({ value, label, type });

        return;
      }

      // Raw text — auto-resolve when typed value exactly matches a known option;
      // otherwise treat as a user email.
      const matchedOption = findExactMatch(value);

      if (matchedOption) {
        if (selectedIds.has(matchedOption.value)) {
          toast.info('Already added');

          return;
        }
        handleOptionSelection(matchedOption);

        return;
      }

      handleAddFreeText(value, label);
    },
    [findExactMatch, selectedIds, handleAddFromDropdown, handleOptionSelection, handleAddFreeText],
  );

  const handleRoleSelect = useCallback((value: string) => setRole(value as ConnectionRoleType), []);

  const handleOpenStateChange = useCallback(() => {
    if (isOpen) {
      initializeScopes();
      // Radix Dialog grabs focus on open; defer to next frame so our focus sticks.
      requestAnimationFrame(() => connectionNameInputRef.current?.focus());
    } else {
      resetFields();
    }
  }, [isOpen, initializeScopes, resetFields]);

  useEffect(() => {
    handleOpenStateChange();
  }, [handleOpenStateChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-BG_WHITE max-h-[90vh] w-[460px] max-w-[460px]'
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
        <DialogBody className='flex flex-col gap-y-4 overflow-visible py-4'>
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

          <div className='flex flex-col gap-y-2 px-4'>
            <label className='f-12-500 text-GRAY_1000'>
              Share with <span className='text-GRAY_600 f-12-400'>(Optional)</span>
            </label>
            <MultiSelectInput
              id={`conn-share-${integrationName}`}
              search={search}
              setSearch={setSearch}
              isOpen={false}
              placeholderText='Share with agents, teams or people'
              inputArrayList={selectedItems}
              setInputArrayList={setSelectedItems}
              showValidationError={showValidationError}
              setShowValidationError={setShowValidationError}
              validationErrorText='Invalid email address'
              onValidateAndAdd={handleValidateAndAdd}
              optionsList={optionsList}
              onSelectOption={handleOptionSelection}
              optionalOpenDropdownOptions={false}
              inputWrapperClassName='max-h-[80px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              roleOptions={ROLE_OPTIONS}
              selectedRole={role}
              setSelectedRole={handleRoleSelect}
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
          <Button
            size='small'
            isLoading={isLoading}
            disabled={!connectionName.trim() || showValidationError}
            onClick={handleConnect}
          >
            Setup connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectIntegrationDialog;
